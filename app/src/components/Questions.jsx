import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Grade from "./Grade";

const Questions = (questionData) => {
  //   console.log(questionData);
  const myData = questionData["questionData"];
  const copiedData = JSON.parse(JSON.stringify(myData));
  const [newData, setNewData] = useState(copiedData);
  const [graded, setGraded] = useState(false);

  const grade = () => {
    setGraded(true);
  };
  const handleChange = (e, key) => {
    const cand = e.target.value;
    setNewData((newData) => {
      const updated = { ...newData };
      updated[key]["Cand"] = cand;
      return updated;
    });
    console.log(newData);
  };

  return graded ? (
    <Grade newData={newData} />
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
                // onChange={(e) => handleChange(e, myData[key]["Answer"])}
                onChange={(e) => handleChange(e, key)}
              />
            ) : (
              <>
                <input
                  type="radio"
                  value="true"
                  name="tf"
                  onChange={(e) => handleChange(e, key)}
                />{" "}
                True
                <input
                  type="radio"
                  value="false"
                  name="tf"
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
