import numpy as np
import pickle
import torch
import json, random
import deepspeed
import itertools
from vidkn import PTuning
from vidkn import RelationDataset
from torch.utils.data import Dataset, DataLoader
from os.path import join, abspath, dirname

def load_ptuning_model():
    ckpt_dir = "./"
    ckpt_name = "epoch_35_lr_1_3_3.9129_50"
    config_file = "./config_vidkn.json"
    num_classes = 9
    template = (2, 4, 1)
    device = torch.cuda.current_device() 
    model = PTuning(num_classes, template, device)
    
    params = [model.pseudo_embeddings.parameters(), model.lstm.parameters(), model.mlp.parameters(), model.model.score.parameters()]
    
    model_engine, _, _, _ = deepspeed.initialize(
        config=config_file,
        model=model,
        model_parameters=itertools.chain(*params)
    )
    model_engine.load_checkpoint(ckpt_dir, ckpt_name)
    model_engine.eval()
    return model_engine

gpt_model = load_ptuning_model()

def load_file(file_dir):
    partition = {'context': [], 'labels':[]}
    data_file = open(join(file_dir))
    for line in data_file:
        sentence = line.split("/") # Split line into a tuple.

        partition['context'].append(sentence[0])
        partition['labels'].append(sentence[1][:-1])
    return partition

def test_model():
    dataset = RelationDataset(load_file('./data/data_vk_test_new.txt'))
    valid_size = len(dataset)
    
    dev_loader = DataLoader(dataset, batch_size=1, shuffle=True)
    # dev_loader = DataLoader(dev_set, batch_size=1)

    #prev_sentence = get_key(sentence_dict, edge[0])
    #post_sentence = get_key(sentence_dict, edge[1])

    # tmp_label = torch.LongTensor([0])
    # with torch.no_grad():
    #     loss, logits = gpt_model(context, tmp_label) 
    #     logits = logits.detach().cpu().numpy()
    #     #prediction_labels = logits.argmax(axis=-1).flatten().tolist()

    #     pred_idx = torch.argsort(torch.from_numpy(logits), dim=1, descending=True)
    #     top3_pred_idx = pred_idx[:, :3].cpu().numpy().tolist()
    hit1 = 0
    hit3 = 0
    with torch.no_grad():
        for step, batch in enumerate(dev_loader):
            batch_x = batch['context']
            batch_y = batch['label']
            loss, logits = gpt_model(batch_x, batch_y)

            batch_size = batch_y.shape[0]
            
            true_labels = batch_y.cpu().numpy().flatten().tolist()
            logits = logits.detach().cpu().numpy()
            prediction_labels = logits.argmax(axis=-1).flatten().tolist()

            pred_idx = torch.argsort(input=torch.from_numpy(logits), dim=1, descending=True)
            top3_pred_idx = pred_idx[:, :3].cpu().numpy().tolist()

            for i in range(batch_size):
                if true_labels[i] == prediction_labels[i]:
                    hit1 += 1
                if true_labels[i] in top3_pred_idx[i]:
                    print("right")
                    print(batch_x, batch_y)
                    hit3 += 1
                else:
                    print("Wrong")
                    print(batch_x)
                    
            
    print("=======================================================")
    print("| TOP 1:", hit1, "/", valid_size, "| TOP 3:", hit3, "/", valid_size) 
    print("=======================================================")

test_model()
        #prediction_labels = logits.argmax(axis=-1).flatten().tolist()

    #     pred_idx = torch.argsort(torch.from_numpy(logits), dim=1, descending=True)
    #     top1_pred_idx = pred_idx[:, :1].cpu().numpy().tolist()
    #     top3_pred_idx = pred_idx[:, :3].cpu().numpy().tolist()
    # print(top3_pred_idx)
    # print(top3_pred_idx)

    # return top3_pred_idx[0] 
