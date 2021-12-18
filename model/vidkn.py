from re import M
from transformers import AutoModelForSequenceClassification, AutoTokenizer, GPTNeoConfig, AdamW, get_linear_schedule_with_warmup, logging
import torch, math
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from os.path import join, abspath, dirname
import deepspeed
import argparse
import itertools
import os
from datetime import datetime

logging.set_verbosity_error()

class PTuning(torch.nn.Module):
    def __init__(self, num_classes, template, device):
        super().__init__()
        self.device = device
        self.tokenizer = AutoTokenizer.from_pretrained("EleutherAI/gpt-neo-2.7B", cache_dir='../huggingface_cache')
        self.model_config = GPTNeoConfig.from_pretrained(pretrained_model_name_or_path="EleutherAI/gpt-neo-2.7B", 
                            num_labels=num_classes, output_attentions=False, output_hidden_states=False)

        #self.pad_token_id = self.tokenizer.pad_token_id if self.tokenizer.pad_token_id is not None else self.tokenizer.unk_token_id
        #self.tokenizer.pad_token_id = self.pad_token_id

        self.pseudo_token = "[Prompt]"
        self.template = template
        
        self.tokenizer.add_special_tokens({'additional_special_tokens': [self.pseudo_token]})
        self.model = AutoModelForSequenceClassification.from_pretrained(
            "EleutherAI/gpt-neo-2.7B", 
            cache_dir='../huggingface_cache', 
            config=self.model_config
        )
        self.model.resize_token_embeddings(len(self.tokenizer))
        self.model.config.pad_token_id = self.model.config.eos_token_id
        self.model = self.model.to(self.device)
        self.tokenizer.pad_token = self.tokenizer.eos_token
        
        for param in self.model.named_parameters():
            if param[0] != 'score.weight':
                param[1].requires_grad = False

        self.embeddings = self.model.base_model.get_input_embeddings()
        self.hidden_size = self.embeddings.embedding_dim
        self.pseudo_token_id = self.tokenizer.get_vocab()[self.pseudo_token]

        self.pseudo_embeddings = nn.Embedding(sum(self.template), self.hidden_size).to(self.device)
        self.pseudo_seq = torch.LongTensor(list(range(sum(self.template))))
        #nn.init.xavier_uniform_(self.pseudo_embeddings.weight)

        self.lstm = nn.LSTM(
            input_size=self.hidden_size,
            hidden_size = self.hidden_size // 2,
            num_layers=2,
            dropout=0.3,
            bidirectional=True,
            batch_first=True
        )

        self.mlp = nn.Sequential(
            nn.Linear(self.hidden_size, self.hidden_size),
            nn.ReLU(),
            nn.Linear(self.hidden_size, self.hidden_size)
        )

    def init_embeddings(self):
        init_prompts = ["Context:", " How are they related?", "and"]
        init_prompts = ["Context:", " How are related?", "and"]
        init_prompts = ["Context:", ". What relationship? ", "and"]
        for p in init_prompts:
            tokens = self.tokenizer(p, return_tensors='pt')
            embeds = self.embeddings(tokens['input_ids'].to(self.device))[0]
            if init_embeddings == None:
                init_embeddings = embeds
            else:
                init_embeddings = torch.cat((init_embeddings, embeds), 0)
        print("======================", init_embeddings.shape)
        self.pseudo_embeddings = torch.nn.Embedding.from_pretrained(init_embeddings, freeze=False)

    def get_pseudo_embeds(self):
        input_embeds = self.pseudo_embeddings(self.pseudo_seq.to(self.device)).half().unsqueeze(0)
        lstm_output = self.lstm(input_embeds)[0].squeeze()
        output_embeds = self.mlp(lstm_output)
        return output_embeds

    def embed_input(self, x):
        tokens = self.tokenizer(x, padding=True, return_tensors='pt')
        token_ids = tokens['input_ids'].to(self.device)
        attention_mask = tokens['attention_mask'].to(self.device)

        pseudo_idx = (token_ids == self.pseudo_token_id)

        token_ids_for_embedding = token_ids.clone()
        token_ids_for_embedding[(token_ids == self.pseudo_token_id)] = self.tokenizer.unk_token_id
        raw_embeds = self.embeddings(token_ids_for_embedding)

        pseudo_embeds = self.get_pseudo_embeds()
        for i in range(raw_embeds.shape[0]):
            raw_embeds[i][pseudo_idx[i]] = pseudo_embeds

        return raw_embeds, attention_mask

    def forward(self, x, label):
        inputs_embeds, attention_mask = self.embed_input(x)

        output = self.model(inputs_embeds=inputs_embeds.half(),
                            attention_mask=attention_mask.half(),
                            labels=label.to(self.device))

        loss = output.loss.to(self.device)
        logits = output.logits.to(self.device)

        return loss, logits

class EarlyStopping():
    def __init__(self, patience=5, delta=0):
        self.patience = patience
        self.delta = delta
        self.counter = 0
        self.best_loss = None
        self.early_stop = False
    
    def __call__(self, loss):
        if self.best_loss == None or self.best_loss - loss > self.delta:
            self.best_loss = loss
            self.counter = 0
        elif self.best_loss - loss < self.delta:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True        

def load_file(file_dir):
    partition = {'context': [], 'labels':[]}
    data_file = open(join(file_dir))
    for line in data_file:
        sentence = line.split("/") # Split line into a tuple.

        partition['context'].append(sentence[0])
        partition['labels'].append(sentence[1][:-1])
    return partition

class RelationDataset(Dataset):
    def __init__(self, partition):
        self.context = partition['context']
        self.class_map = {'used': 0, 'example': 1, 'hyponym': 2, 'step': 3, 'attribute': 4, 'compare': 5, 'part': 6, 'identification':7, 'causeeffect':8}
        self.label = partition['labels']

    def __len__(self):
        return len(self.label)
    
    def __getitem__(self, idx):
        class_id = self.class_map[self.label[idx]]
        class_id = torch.tensor([class_id])
        return {"context": self.context[idx], 
                #"entities": self.entities[idx],
                "label": class_id}

if __name__ == "__main__":
    s = datetime.now().strftime('%H:%M')
    lr = 1e-3
    # os.makedirs('{}-{}'.format(s, lr))
    device = torch.cuda.current_device()
    #device = torch.device('cpu')

    template = (2, 4, 1)
    num_classes = 9

    model = PTuning(num_classes, template, device)
    param = [model.model.score.parameters(), model.pseudo_embeddings.parameters(), model.lstm.parameters(), model.mlp.parameters()]

    dataset = RelationDataset(load_file('./data/data_vk.txt'))
    data_size = len(dataset)
    train_size = int(0.7*data_size)
    valid_size = int(0.3*data_size)
    test_size = data_size-(train_size+valid_size)
    train_set, dev_set, test_set = torch.utils.data.random_split(dataset, [train_size, valid_size, test_size])
    train_loader = DataLoader(train_set, batch_size=4, shuffle=True)
    dev_loader = DataLoader(dev_set, batch_size=1)

    train_engine, optimizer, _, _ = deepspeed.initialize(
        config='./config_vidkn.json',
        model=model,
        model_parameters=itertools.chain(*param)
    )

    early_stopping = EarlyStopping(15, 0)

    #early_stopping = EarlyStopping(10, 0.1)

    for j in range(100):
        running_loss = 0
        hit1 = 0
        hit3 = 0

        model.train()
        for step, batch in enumerate(train_loader):
            batch_x = batch['context']
            batch_y = batch['label']
            loss, logits = train_engine(batch_x, batch_y)

            batch_size = batch_y.shape[0]

            train_engine.backward(loss)        
            train_engine.step()
        
            running_loss += loss.item()

            true_labels = batch_y.cpu().numpy().flatten().tolist()

            logits = logits.detach().cpu().numpy()
            prediction_labels = logits.argmax(axis=-1).flatten().tolist()

            pred_idx = torch.argsort(input=torch.from_numpy(logits), dim=1, descending=True)
            top3_pred_idx = pred_idx[:, :3].cpu().numpy().tolist()

            for i in range(batch_size):
                if true_labels[i] == prediction_labels[i]:
                    hit1 += 1
                if true_labels[i] in top3_pred_idx[i]:
                    hit3 += 1
    
        print("=======================================================")
        print("EPOCH:", j, "| LOSS:", running_loss / train_size, "| TOP 1:", hit1, "/", train_size, "| TOP 3:", hit3, "/", train_size) 
        print("=======================================================")

        total_loss = 0
        total_hit1 = 0
        total_hit3 = 0

        model.eval()

        with torch.no_grad():
            for step, batch in enumerate(dev_loader):
                batch_x = batch['context']
                batch_y = batch['label']
                loss, logits = train_engine(batch_x, batch_y)

                batch_size = batch_y.shape[0]

                total_loss += loss.item()

                true_labels = batch_y.cpu().numpy().flatten().tolist()

                logits = logits.detach().cpu().numpy()
                prediction_labels = logits.argmax(axis=-1).flatten().tolist()

                pred_idx = torch.argsort(torch.from_numpy(logits), dim=1, descending=True)
                top3_pred_idx = pred_idx[:, :3].cpu().numpy().tolist()

                for i in range(batch_size):
                    if true_labels[i] == prediction_labels[i]:
                        total_hit1 += 1
                    if true_labels[i] in top3_pred_idx[i]:
                        total_hit3 += 1
            
        print("=======================================================")
        print("DEV:", j, "| LOSS:", total_loss / valid_size, "| TOP 1:", total_hit1, "/", valid_size, "| TOP 3:", total_hit3, "/", valid_size) 
        print("=======================================================")

        if j % 5 == 0:
            train_engine.save_checkpoint('./vidkn_model/{}-{}'.format(s, lr), round(total_loss / valid_size, 4))

        if j > 20:
            early_stopping(total_loss / valid_size)
            if early_stopping.early_stop:
                print("EARLY STOPPING")
                print("SAVING: ", j, "| LOSS:", total_loss / valid_size, "| TOP 1:", total_hit1, "/", valid_size, "| TOP 3:", total_hit3, "/", valid_size)
                #train_engine.save_checkpoint('./vidkn_model', total_loss / valid_size)
                break

        #early_stopping(total_loss / valid_size)
        #if early_stopping.early_stop:
        #    print("EARLY STOPPING")
        #    break

