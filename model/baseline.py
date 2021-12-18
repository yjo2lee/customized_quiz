from transformers import AutoTokenizer, GPTNeoForCausalLM, GPTNeoConfig, GPTNeoForSequenceClassification
import torch
import deepspeed

device = torch.cuda.current_device()
# from torch.nn.utils.rnn import pad_sequencesjlee

tokenizer = AutoTokenizer.from_pretrained("EleutherAI/gpt-neo-2.7B", cache_dir='/hdd/taesoo/gpt-neo/taesoo/huggingface_cache')
model_config = GPTNeoConfig.from_pretrained(
            pretrained_model_name_or_path="EleutherAI/gpt-neo-2.7B",
            output_attentions=False, output_hidden_states=False
        )
model = GPTNeoForCausalLM(model_config).from_pretrained(
            "EleutherAI/gpt-neo-2.7B", 
            cache_dir='/hdd/taesoo/gpt-neo/taesoo/huggingface_cache'
        )
model.config.pad_token_id = model.config.eos_token_id
tokenizer.pad_token = tokenizer.eos_token

def read_file(file_name):
    f = open(file_name, "r")
    test_data = []
    label_data = []
    for line in f:
        label = line.split("/")[1]
        line = line.split("/")[0]
        entities = line.split("[Prompt]")[6:]
        question = line.split("[Prompt]")[2]
        line = line.replace("[Prompt]", "")
        template = "The answer that best describes the relationship between {} and {} is".format(entities[0], entities[1])
        final_line = "Sentence: {}\n".format(question) + template 
        test_data.append(final_line)
        label_data.append(label)
    return test_data, label_data

def iteration(input_ids):
  answer_array = []
  for epoch in range(1):
    gen_tokens = model.generate(input_ids, top_p=1.0, top_k=0, repetition_penalty = 1.0, temperature=0, max_length=210)
    gen_text = tokenizer.batch_decode(gen_tokens)[0]
    pred_answer = gen_text[len(prompt)+1]
    answer_array.append(pred_answer)
    epoch += 1
    if len(set(answer_array)) == 3:
      break
  return list(set(answer_array))

def get_key(my_dict, val):
  for key, value in my_dict.items():
    if val == value:
      return key  

file_name = "/hdd/taesoo/gpt-neo/yoonjoo/ptuning/data/data_vk_test_new.txt"
test_data, label_data = read_file(file_name)
print(test_data, label_data)
correct_num = 0
label_dict = {'A': 'hyponym\n', 'B': 'example\n', 'C': 'used\n', 'D': 'step\n', 'E': 'part\n', 'F': 'attribute\n',
              'G': 'effect\n', 'H': 'compare\n', 'I': "identification\n", 'J': "causeefect\n"}

pred_answer_dict = {}
for i in range(len(test_data)):
# for i in range(3):    
    task = test_data[i]
    label = label_data[i]
    template = "A) hyponym\n " \
            "B) example\n " \
            "C) used\n " \
            "D) step\n "  \
            "E) part\n " \
            "F) attribute\n " \
            "G) effect\n " \
            "H) compare\n " \
            "I) identification\n" \
            "J) causeefect\n" \
            "Sentence: Our first learning algorithm will be linear regression.\n" \
            "Task: The answer that best describes the relationship between linear regression and supervised learning is A.\n" \
            "Sentence: We categorize distributions into three in terms of skewness. Left skewed, symmetric, and right skewed.\n" \
            "Task: The answer that best describes the relationship between left-skewness and right-skewness is H.\n" 

    prompt = template + task
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids
    answer_list = iteration(input_ids)
    print(i)
    print(answer_list)
    print(get_key(label_dict, label))
    #   print(label)
    pred_answer_dict[i] = answer_list

    if get_key(label_dict, label) in answer_list:
        correct_num += 1
    print(correct_num)

print("final_num", correct_num)
