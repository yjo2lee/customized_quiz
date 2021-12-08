import "./App.css";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import RangeSlider from "react-bootstrap-range-slider";
import bookIcon from "./image/book.png";
import NumericInput from "react-numeric-input";
import Questions from "./components/Questions";
import deeplearningData from "./components/deeplearningData";
import iotData from "./components/iotData";

const App = () => {
  const [numQ, setNumQ] = React.useState(5);
  const [ratio, setRatio] = React.useState(3);
  const [level, setLevel] = React.useState(2);
  const [generated, setGenerated] = useState(false);
  const [lecture, setLecture] = useState("Choose a lecture");
  const [text, setText] = useState("");
  const [selectedData, setSelectedData] = useState(deeplearningData);

  const generate = () => {
    setGenerated(true);
  };
  const chooseLectureDL = () => {
    setLecture("Deep Learning");
    setText(
      "Before we deep dive into how AI works, and its various use cases and applications, let’s differentiate some of the closely related terms and concepts of AI: artificial intelligence, machine learning, deep learning, and neural networks. These terms are sometimes used interchangeably, but they do not refer to the same thing. Artificial intelligence is a branch of computer science dealing with a simulation of intelligent behavior. AI systems will typically demonstrate behaviors associated with human intelligence such as planning, learning, reasoning, problem-solving, knowledge representation, perception, motion, and manipulation, and to a lesser extent social intelligence and creativity. Machine learning is a subset of AI that uses computer algorithms to analyze data and make intelligent decisions based on what it has learned, without being explicitly programmed. Machine learning algorithms are trained with large sets of data and they learn from examples. They do not follow rules-based algorithms. Machine learning is what enables machines to solve problems on their own and make accurate predictions using the provided data. Deep learning is a specialized subset of Machine Learning that uses layered neural networks to simulate human decision-making. Deep learning algorithms can label and categorize information and identify patterns. It is what enables AI systems to continuously learn on the job, and improve the quality and accuracy of results by determining whether decisions were correct. Artificial neural networks often referred to simply as neural networks take inspiration from biological neural networks, although they work quite a bit differently. A neural network in AI is a collection of small computing units called neurons that take incoming data and learn to make decisions over time. Neural networks are often layered deep and are the reason deep learning algorithms become more efficient as the datasets increase in volume, as opposed to other machine learning algorithms that may plateau as data increases. Now that you have a broad understanding of the differences between some key AI concepts, there is one more differentiation that is important to understand, that between artificial intelligence and data science. Data science is the process and method for extracting knowledge and insights from large volumes of disparate data. It’s an interdisciplinary field involving mathematics, statistical analysis, data visualization, machine learning, and more. It’s what makes it possible for us to appropriate information, see patterns, find meaning from large volumes of data, and use it to make decisions that drive business. Data Science can use many of the AI techniques to derive insight from data. For example, it could use machine learning algorithms and even deep learning models to extract meaning and draw inferences from data. There is some intersection between AI and data science, but one is not a subset of the other. Rather, data science is a broad term that encompasses the entire data processing methodology. Well, AI includes everything that allows computers to learn how to solve problems and make intelligent decisions. Both AI and Data Science can involve the use of big data that is significantly large volumes of data. In the next few lessons, the terms machine learning, deep learning, and neural networks will be discussed in more detail. (Music)"
    );
  };
  const chooseLectureIoT = () => {
    setSelectedData(iotData);
    setLecture("Internet of Things");
    setText(
      "Let’s take a look at another. Let’s talk about logistics. Tracking things okay, logistics. So say you are Walmart or some big company or your the military, something like that, and you want to move lots of things between different places on a certain time scale, right? You need to get these from this manufacturing place to this sales place on this schedule. That’s logistics. And the military is all about logistics, right? We are waging a war. We need to get these devices from here to here and these people from here to here on this time frame. So you wanna move things. So say you’re Walmart, and you would have to be able to track these devices that you’re moving. You wanna make sure that they are moving place to place in a certain time frame. And you want to be able to at any time, be able to say, where is box number whatever, right? How many boxes do we have of this type of device at this location at this time? And you need to be able to track that dynamically, so you can get count for things like, weather difficulties, right? Maybe the planes are shut down so you can’t move enough devices from here to here. So you need to know how many are here so you can reroute things. So, to do that, one way, a very common way, is to use barcodes. This helps you because every box, every device, it has a barcode which has some basic information about what’s in the box, right? And where the box came from, stuff like that, gets stuck on the box. Now, barcodes are in very common use today. We use barcodes, if you look at any food item, you go to the supermarket and you check yourself out, you run the barcode over the scanner. So barcodes are very useful and they have a certain amount of information on there and they make it so that you can just scan the device and find out information about the device, or whatever it is, the box. And it makes it easy to track. So this is basically old technology, barcodes have been around for a long time. Nowadays, you also find RFID tags. So RFID tags, you can see the antenna, for one, right there. It’s basically an electronic version of a bar code. And what you’re seeing is that sort of spiraling wire, that’s actually the antenna, okay? A remote antenna. And what RFID tags allow you to do, why they’re an improvement over barcodes is, the first thing is, they basically have a processor inside there. So you can have a lot more information about the device than what you could encode inside a barcode, right? A ton more information. And that information can change, right? Because barcode, once you print that on the box, that will never change, right? Until you rip off the barcode, put a new barcode on. But that data can never change. With an RFID tag, that thing could have flash memory in there if you want to, that actually reloads, that gets changed and updated over time. So for instance, if you want to track where a box moved, t he box itself and it’s RFID can store that information over time. So, as it moves from place to place you can store that and you can see the whole path that the box took, all right? So, RFID another benefit of these, is that you don’t have to be right next to them to scan them. So, if you know anything about a barcode, you have to take a scanner and put it right up to the barcode in order to scan it, you have to try, right? You have to, I mean, if you ever scan, like just yesterday I was at Albertson’s, scanning food out. I have to work to get that scanner directly over my barcode, right? With RFID tags, there’s a range. So you just have to be within proximity. You don’t have to have any particular orientation. Just be near it, which is helpful, right? Then you can just run every box near a scanner, and it’ll catch it. So RFID tags have a lot of advantages over barcodes and they can easily be networked. So the scanner can be network connected to the Internet so you can keep constant track of where all your boxes are at some global site. So Walmart can know where every box is and what manufacturer, what plant it’s in. And they can keep it all centrally because the IoT RFID scanner is actually connected on the network to its main cloud service. So, devices can become an IoT device if you put RFID tags and the computational intelligence on to them. Thank you. [MUSIC]"
    );
  };
  return generated ? (
    <Questions
      questionData={selectedData}
      numQ={numQ}
      ratio={ratio}
      level={level}
    />
  ) : (
    <div className="App">
      {/* <header className="App-header"></header> */}
      <div className="body">
        <div className="top">
          <img src={bookIcon} width={50}></img>
          <h1>Create a Customized Quiz!</h1>
        </div>
        <div className="item">
          <div className="title">Topic:</div>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {lecture}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={chooseLectureDL}>
                Deep Learning
              </Dropdown.Item>
              <Dropdown.Item onClick={chooseLectureIoT}>
                Internet of Things
              </Dropdown.Item>
              {/* <Dropdown.Item href="#/action-3">Trees and Flowers</Dropdown.Item> */}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="textbox">{text}</div>
        <div className="item">
          <div className="title">Number of Questions:</div>
          <NumericInput
            className="form-control"
            min={5}
            max={30}
            step={1}
            size={3}
            onChange={(value) => setNumQ(value)}
          ></NumericInput>
        </div>
        <div className="item">
          <div className="title">Question Type Ratio:</div>
          <div className="label">True/False</div>
          <RangeSlider
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
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
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            min={1}
            max={3}
            tooltip="off"
          />
          <div className="label">Hard</div>
        </div>
        <Button variant="warning" onClick={generate}>
          Generate
        </Button>{" "}
      </div>
    </div>
  );
};

export default App;
