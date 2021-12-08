import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";

const Grade = (newData) => {
  const myData = newData["newData"];
  const numQuestions = Object.keys(myData).length;
  const [score, setScore] = useState(0);

  useEffect(() => {
    Object.keys(myData).map((key, idx) => {
      if (myData[key]["Answer"] === myData[key]["Cand"]) {
        setScore(score + 1);
      }
    });
  }, []);

  return (
    <div className="question-body">
      <div className="area">
        {Object.keys(myData).map((key, idx) => (
          <div className="question">
            <div className="description">
              {idx + 1}. {myData[key]["Question"]}
            </div>
            {myData[key]["Answer"] === myData[key]["Cand"] ? (
              <div className="correct">Correct!</div>
            ) : (
              <div className="wrong">Please try it again.</div>
            )}
            {myData[key]["Type"] === 1 ? ( // short-answer questions
              <input type="text" placeholder={myData[key]["Cand"]} />
            ) : (
              <>
                <input
                  type="radio"
                  value="true"
                  name="tf"
                  checked={myData[key]["Cand"] === "true"}
                />{" "}
                True
                <input
                  type="radio"
                  value="false"
                  name="tf"
                  className="radio"
                  checked={myData[key]["Cand"] === "false"}
                />{" "}
                False
              </>
            )}
          </div>
        ))}
      </div>
      <div className="score">
        Score: {score}/{numQuestions}
      </div>
    </div>
  );
};

export default Grade;
