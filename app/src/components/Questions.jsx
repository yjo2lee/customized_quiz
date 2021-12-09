import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Grade from "./Grade";

const Questions = ({ questionData, numQ, ratio, level }) => {
  const [newData, setNewData] = useState({});
  const [myData, setMyData] = useState({});
  const [graded, setGraded] = useState(false);
  const numSH = Math.floor(((ratio - 1) * numQ) / 4);
  const numTF = numQ - numSH;
  const questionDataEntries = Object.entries(questionData);
  const question_0_1_arr = questionDataEntries.filter(function ([key, value]) {
    return value["Type"] === 0 && value["Level"] === 1;
  });
  const question_0_2_arr = questionDataEntries.filter(function ([key, value]) {
    return value["Type"] === 0 && value["Level"] === 2;
  });
  const question_0_3_arr = questionDataEntries.filter(function ([key, value]) {
    return value["Type"] === 0 && value["Level"] === 3;
  });
  const question_1_1_arr = questionDataEntries.filter(function ([key, value]) {
    return value["Type"] === 1 && value["Level"] === 1;
  });
  const question_1_2_arr = questionDataEntries.filter(function ([key, value]) {
    return value["Type"] === 1 && value["Level"] === 2;
  });
  const question_1_3_arr = questionDataEntries.filter(function ([key, value]) {
    return value["Type"] === 1 && value["Level"] === 3;
  });
  const question_0_1 = Object.fromEntries(question_0_1_arr);
  const question_0_2 = Object.fromEntries(question_0_2_arr);
  const question_0_3 = Object.fromEntries(question_0_3_arr);
  const question_1_1 = Object.fromEntries(question_1_1_arr);
  const question_1_2 = Object.fromEntries(question_1_2_arr);
  const question_1_3 = Object.fromEntries(question_1_3_arr);

  var tf_questions;
  var sh_questions;

  useEffect(() => {
    if (level == 1) {
      console.log("a");
      tf_questions = question_0_1;
      sh_questions = question_1_1;
    } else if (level == 2) {
      console.log("b");
      tf_questions = question_0_2;
      sh_questions = question_1_2;
    } else {
      console.log("c");
      tf_questions = question_0_3;
      sh_questions = question_1_3;
    }
    console.log(question_0_3);
    console.log(tf_questions);

    if (numTF !== 0) {
      if (Math.floor(Object.keys(tf_questions).length / numTF) === 1) {
        Object.keys(tf_questions).map((key, idx) => {
          if (idx < numTF) {
            setMyData((data) => {
              const updated = { ...data };
              updated[key] = questionData[key];
              return updated;
            });
          }
        });
      } else {
        Object.keys(tf_questions).map((key, idx) => {
          if (
            (idx + 1) % Math.floor(Object.keys(tf_questions).length / numTF) ===
            0
          ) {
            setMyData((data) => {
              const updated = { ...data };
              updated[key] = questionData[key];
              return updated;
            });
          }
        });
      }
    }
    if (numSH !== 0) {
      if (Math.floor(Object.keys(sh_questions).length / numSH) === 1) {
        Object.keys(sh_questions).map((key, idx) => {
          if (idx < numSH) {
            setMyData((data) => {
              const updated = { ...data };
              updated[key] = questionData[key];
              return updated;
            });
          }
        });
      } else {
        Object.keys(sh_questions).map((key, idx) => {
          if (
            (idx + 1) % Math.floor(Object.keys(sh_questions).length / numSH) ===
            0
          ) {
            setMyData((data) => {
              const updated = { ...data };
              updated[key] = questionData[key];
              return updated;
            });
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    // console.log(myData);
    const copiedData = JSON.parse(JSON.stringify(myData));
    setNewData(copiedData);
  }, [myData]);

  const grade = () => {
    setGraded(true);
  };
  const handleChange = (e, key) => {
    console.log(newData);
    const cand = e.target.value;
    setNewData((newData) => {
      const updated = { ...newData };
      updated[key]["Cand"] = cand;
      return updated;
    });
  };

  return graded ? (
    <Grade myData={newData} />
  ) : (
    <div className="question-body">
      <div className="area">
        {Object.keys(myData).map((key, idx) => (
          <div className="question">
            <div className="description">
              {idx + 1}. {myData[key]["Question"]}
            </div>
            {myData[key]["Type"] === 1 ? ( // short-answer questions
              <input
                type="text"
                placeholder="answer"
                onChange={(e) => handleChange(e, key)}
              />
            ) : (
              <>
                <input
                  type="radio"
                  value="true"
                  // name="tf"
                  onChange={(e) => handleChange(e, key)}
                />{" "}
                True
                <input
                  type="radio"
                  value="false"
                  // name="tf"
                  className="radio"
                  onChange={(e) => handleChange(e, key)}
                />{" "}
                False
              </>
            )}
          </div>
        ))}
      </div>
      <Button variant="warning" onClick={grade}>
        Submit
      </Button>
    </div>
  );
};

export default Questions;
