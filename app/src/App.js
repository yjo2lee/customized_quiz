import "./App.css";
import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import RangeSlider from "react-bootstrap-range-slider";
import bookIcon from "./image/book.png";
import NumericInput from "react-numeric-input";

const App = () => {
  const [value1, setValue1] = React.useState(2);
  const [value2, setValue2] = React.useState(0);
  return (
    <div className="App">
      {/* <header className="App-header"></header> */}
      <div className="body">
        <h2>Create a Customized Quiz!</h2>
        <img src={bookIcon} width={50}></img>
        <div className="item">
          <div className="title">Topic</div>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Deep Learning
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="#/action-1">Deep Learning</Dropdown.Item>
              <Dropdown.Item href="#/action-2">Music History</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Trees and Flowers</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="item">
          <div className="line" />
        </div>
        <div className="item">
          <div className="title">Number of Questions:</div>
          {/* <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Dropdown Button
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
              <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> */}
          <NumericInput
            min={5}
            max={30}
            value={10}
            style={{
              wrap: {
                // background: "#E2E2E2",
                // boxShadow: "0 0 1px 1px #fff inset, 1px 1px 5px -1px #000",
                // padding: "2px 2.26ex 2px 2px",
                // borderRadius: "6px 3px 3px 6px",
                fontSize: 22,
              },
              arrowUp: {
                width: "5px",
                // borderBottomColor: "rgba(66, 54, 0, 0.63)",
              },
              arrowDown: {
                // borderTopColor: "rgba(66, 54, 0, 0.63)",
              },
            }}
          ></NumericInput>
        </div>
        <div className="item">
          <div className="title">Question Types:</div>
          <div className="label">True/False</div>
          <RangeSlider
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            min={1}
            max={5}
            tooltip="off"
          />
          <div className="label">Short answer</div>
        </div>
        <div className="item2">
          <div className="title">Difficulty Level:</div>
          <div className="label">Easy</div>
          <RangeSlider
            value={value2}
            onChange={(e) => setValue2(e.target.value)}
            min={1}
            max={5}
            tooltip="off"
          />
          <div className="label">Hard</div>
        </div>
        <Button variant="warning">Generate</Button>{" "}
      </div>
    </div>
  );
};

export default App;
