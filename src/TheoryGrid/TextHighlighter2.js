import React from "react";
import PropTypes from "prop-types";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Card from "@material-ui/core/Card";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";

const propTypes = {
  //text: PropTypes.string.isRequired,
  customClass: PropTypes.string,
  selectionHandler: PropTypes.func
};

const range = function(start, end) {
  var ans = [];
  for (let i = start; i <= end; i++) {
    ans.push(i);
  }
  return ans;
};

const getSpanArray = function(cBlocks) {
  var sArray = [];
  for (let i = 0; i < cBlocks.length; i++) {
    var { html } = cBlocks[i];
    sArray.push(html);
  }
  return sArray;
};

const getCurrentAnswer = function(cBlocks) {
  var sArray = [];
  for (let i = 0; i < cBlocks.length; i++) {
    var { text, classN } = cBlocks[i];
    if (classN !== "noClass") {
      sArray.push(text.trim());
    }
  }
  return sArray.join(" ");
};

const getPrevCumLength = function(uSet) {
  let lA = [0];
  let lCounter = 0;
  if (uSet.length > 1) {
    for (let i = 1; i < uSet.length; i++) {
      var { textlength } = uSet[i - 1];
      lCounter += textlength;
      lA.push(lCounter);
    }
  }
  return lA;
};

const getChunk = function(text, firstTInd, lastTInd, index, className) {
  let textSlice = text.slice(firstTInd, lastTInd);

  return {
    range: range(firstTInd, lastTInd),
    text: textSlice,
    textlength: textSlice.length,
    html: (
      <span data-order={index - 1} className={className} key={index}>
        {textSlice}
      </span>
    ),
    classN: className
  };
};

const getHighlightCssClassName = function(mainType) {
  let classname;
  switch (mainType) {
    case "das Objekt":
      classname = "highlight objekt";
      break;
    case "das Prädikat":
      classname = "highlight pradikat";
      break;
    case "das Prädikativ":
      classname = "highlight pradikativ";
      break;
    case "die Adverbiale Bestimmung":
      classname = "highlight adverbial";
      break;
    case "das Subjekt":
      classname = "highlight subjekt";
      break;
    default:
      classname = "wrong class given in gsheet..";
  }

  return classname;
};

/**
 * Highlighter component.
 *
 * Allows highlighting of the text selected by mouse with given custom class (or default)
 * and calls optional callback function with the following selection details:
 * - selected text
 * - selection start index
 * - selection end index
 */
export class HighLighter extends React.Component {
  constructor(props) {
    super(props);

    var randQindex = Math.ceil(
      Math.random() * Math.max(this.props.inpData.length - 1, 1)
    );
    var questionRow = this.props.inpData[randQindex];
    var { sentence, mainType, answer } = questionRow;
    console.log("randQindex", randQindex);
    console.log("questionRow", questionRow);
    console.log("mainType", mainType);
    console.log("cAnswer", sentence);

    this.state = {
      parsingQData: this.props.inpData,
      text: sentence,
      mainType: mainType,
      isDirty: false,
      selection: "",
      selCollection: "",
      anchorNode: "?",
      focusNode: "?",
      cAnswer: "",
      answerState: "",
      realAnswer: answer,
      selectionStart: 0,
      selectionEnd: 0,
      prevCumLength: [0],
      first: sentence,
      middle: "",
      last: "",
      registerCount: 0,
      selectedClass: "das Subjekt",
      spanArray: [
        <span data-order="0" key="0">
          {sentence}
        </span>
      ],
      selectionArray: []
    };
    this.onMouseUpHandler = this.onMouseUpHandler.bind(this);
    this.nextPQ = this.nextPQ.bind(this);
  }

  // var randBase = Math.random();
  // var inpLength = this.props.inpData.length;
  // var randQindex = Math.ceil(randBase * Math.max(this.props.inpData.length - 1, 1));

  // const questionRow = props.inpData[randQindex];
  // console.log("questionRow: ", questionRow);

  getContiguousBlocks(inpArray, classAsignment) {
    var outputArray = [];
    var lastFirstInd = 0;
    var index = 1;
    var textchunk;
    var textlength = this.state.text.length;

    // Case: first snippet of text not included in selection,
    //       and must be assigned to 'noClass'
    if (inpArray[lastFirstInd] > 0) {
      textchunk = getChunk(
        this.state.text,
        0,
        inpArray[lastFirstInd],
        index,
        "noClass"
      );

      outputArray.push(textchunk);
      index++;
    }

    // Case: middle part.
    for (let i = 0; i <= inpArray.length; i++) {
      //
      if (i === inpArray.length - 1 || inpArray[i + 1] - inpArray[i] > 1) {
        textchunk = getChunk(
          this.state.text,
          inpArray[lastFirstInd],
          inpArray[i] + 1,
          index,
          classAsignment
        );

        outputArray.push(textchunk);
        lastFirstInd = i;
        index++;

        //
        if (inpArray[i + 1] - inpArray[i] > 1) {
          textchunk = getChunk(
            this.state.text,
            inpArray[i] + 1,
            inpArray[i + 1],
            index,
            "noClass"
          );

          outputArray.push(textchunk);
          index++;
          lastFirstInd = i + 1;
        }
      }
    }

    // Case: last part.
    if (inpArray[lastFirstInd] < textlength + 1) {
      console.log(
        "last part: array length",
        inpArray.length,
        "lastFirstInd: ",
        lastFirstInd
      );
      textchunk = getChunk(
        this.state.text,
        inpArray[lastFirstInd] + 1,
        textlength,
        index,
        "noClass"
      );
      outputArray.push(textchunk);
      index++;
    }

    return outputArray;
  }

  getUniqueSet(arrayObject, classAsignment) {
    var completeArray = [];
    for (var i = 0; i < arrayObject.length; i++) {
      const N = arrayObject[i].selectionEnd - 1;
      const Nmin = arrayObject[i].selectionStart;
      const tempSeq = range(Nmin, N);
      completeArray.push(tempSeq);
    }
    completeArray = Array.from(new Set(completeArray.flat())).sort(function(
      a,
      b
    ) {
      return a - b;
    });
    var contigArray = this.getContiguousBlocks(completeArray, classAsignment);
    console.log("completeArray: ", completeArray);
    console.log("contigArray: ", contigArray);
    return contigArray;
  }

  onMouseUpHandler(e) {
    e.preventDefault();
    const selectionObj = window.getSelection && window.getSelection();
    const selection = selectionObj.toString();
    const anchorNode = selectionObj.anchorNode;
    const focusNode = selectionObj.focusNode;
    const anchorOffset = selectionObj.anchorOffset;
    const focusOffset = selectionObj.focusOffset;
    const position = anchorNode.compareDocumentPosition(focusNode);
    let forward = false;

    if (position === anchorNode.DOCUMENT_POSITION_FOLLOWING) {
      forward = true;
    } else if (position === 0) {
      forward = focusOffset - anchorOffset > 0;
    }
    let dataOrder = focusNode.parentNode.getAttribute("data-order");
    let selectionStart = forward ? anchorOffset : focusOffset;
    selectionStart = selectionStart + this.state.prevCumLength[dataOrder];
    const selectionEnd = selectionStart + selection.length;
    const middle = this.state.text.slice(selectionStart, selectionEnd);
    const last = this.state.text.slice(selectionEnd);

    const newinfo = {
      middle: middle,
      selectionStart: selectionStart,
      selectionEnd: selectionEnd,
      selectedClass: this.state.selectedClass
    };

    this.state.selectionArray.push(newinfo);

    var uSet = this.getUniqueSet(this.state.selectionArray);
    var cAnswer = getCurrentAnswer(uSet);
    var answerState = cAnswer === this.state.realAnswer ? "correct" : "";
    console.log(
      "current answer: ",
      cAnswer,
      "real answer: ",
      this.state.realAnswer
    );

    var highlightC = getHighlightCssClassName(this.state.mainType);
    console.log("highlightC: ", highlightC);

    this.setState({
      spanArray: getSpanArray(
        this.getUniqueSet(this.state.selectionArray, highlightC)
      ),
      prevCumLength: getPrevCumLength(uSet),
      cAnswer: cAnswer,
      answerState: answerState
    });

    this.setState({
      selection: selection,
      anchorNode: anchorNode,
      focusNode: focusNode,
      selectionStart,
      selectionEnd,
      // first,
      middle,
      last,
      registerCount: this.state.registerCount + 1
    });

    if (this.props.selectionHandler) {
      this.props.selectionHandler({
        selection,
        selectionStart,
        selectionEnd
      });
    }
  }

  handleChange = event => {
    this.setState({
      selectedClass: event.target.value
    });
  };

  nextPQ() {
    var randQindex = Math.ceil(
      Math.random() * Math.max(this.state.parsingQData.length - 1, 1)
    );
    var questionRow = this.state.parsingQData[randQindex];
    var { sentence, mainType, answer } = questionRow;

    console.log("Questionrow", questionRow);

    this.setState({
      text: sentence,
      mainType: mainType,
      answerState: "",
      cAnswer: "",
      realAnswer: answer,
      spanArray: [
        <span data-order="0" key="0">
          {sentence}
        </span>
      ],
      selectionArray: []
    });

    console.log("new question: ", sentence, "updated state: ", this.state.text);
    console.log("new type: ", mainType, "updated state: ", this.state.mainType);
    console.log(
      "new answer: ",
      answer,
      "updated state: ",
      this.state.realAnswer
    );
  }

  render() {
    return (
      <Card>
        <h1>Parsing challenge</h1>
        <h2>bitte markieren Sie {this.state.mainType}</h2>
        {/* 
        <RadioGroup
          aria-label="gender"
          name="gender1"
          value={this.state.selectedClass}
          onChange={this.handleChange}
        >
          <FormControlLabel
            value="das Subjekt"
            control={<Radio />}
            label="das Subjekt"
          />
          <FormControlLabel
            value="das Prädikat"
            control={<Radio />}
            label="das Prädikat"
          />
          <FormControlLabel
            value="das Objekt"
            control={<Radio />}
            label="das Objekt"
          />
          <FormControlLabel
            value="adverbiale Bestimmung"
            control={<Radio />}
            label="adverbiale Bestimmung"
          />
          <FormControlLabel
            value="das Prädikativ"
            control={<Radio />}
            label="das Prädikativ"
          />
        </RadioGroup>
        */}
        <span onMouseUp={this.onMouseUpHandler}>
          {/* <span data-order="first">{this.state.first}</span>*/}
          <br />
          {this.state.spanArray}
        </span>
        <p>{this.state.answerState}</p>
        <Button variant="contained" type="button" onClick={this.nextPQ}>
          Next question
        </Button>
      </Card>
    );
  }
}

HighLighter.propTypes = propTypes;
