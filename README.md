# Creating Customized Quiz from Learning Materials

## Introduction

Final Project of CS492 Introduction to Deep Learning

Team 44 - Saelyne Yang, Yoonjoo Lee

Our project generates customized quiz (QA sets) that asks about concepts and relationships between them.

## Code sturcture

    .
    ├── app     # Source code for the web application
    │   ├── src
    │   │   ├── App.js          # Main page
    │   │   ├── components
    │   │   │   ├── Questions.jsx   # Questions page
    │   │   │   ├── Grade.jsx       # Grading page
    ├── data    # Dataset of QA sets generated from our model
    │   └── ai_data_new.json        # QA sets for the lecture "AI"
    │   └── iot_data_new.json       # QA sets for the lecture "IoT"
    ├── model   # Ptuining model and data
    │    └── vidkn.py        # p-tuniing 
    │    └── vidkn_test.py        # test with ptuning prompt
    │    └── baseline.py        # test with manual prompt
    │    └── config_vidkn.json        
    │    │   ├── data
    │    │   │   ├── data_vk_test.txt   # test data
    └──  └── └── └── data_vk_train.txt  # training data

    

## How to run the application

navigate to `app/` and run `npm install`, `npm start`

## How to run the ptuning model
navigate to `model/` and run `deepspeed --num_gpus=1 vidkn.py`

## How to test the ptuning model
navigate to `model/` and run `deepspeed --num_gpus=1 vidkn_test.py`

## How to run the baseline model
navigate to `model/` and run `python baseline.py`

## Application screenshot

![Application](./main.png)
