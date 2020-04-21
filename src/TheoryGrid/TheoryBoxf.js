import React, { Fragment } from "react";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import Card from "@material-ui/core/Card";

// function get_table(data) {
//   let result = ['<table border=1>'];
//   for(let row of data) {
//       result.push('<tr>');
//       for(let cell of row){
//           result.push(`<td>${cell}</td>`);
//       }
//       result.push('</tr>');
//   }
//   result.push('</table>');
//   return result.join('\n');
// }

function get_table(myArray) {
  var result = "<table border=1>";
  for (var i = 0; i < myArray.length; i++) {
    const { nl, duits } = myArray[i];
    result +=
      "<tr>" + "<td>" + nl + "</td>" + "<td>" + duits + "</td>" + "</tr>";
    // result += "<td>"+nl+"</td>";
    // result += "<td>"+duits+"</td>";
    // result += "</tr>";
  }
  result += "</table>";

  var jsx_result = (
    <div
      className="exampleTable"
      dangerouslySetInnerHTML={{ __html: result }}
    />
  );

  return jsx_result;
}

const getTable = function(inpData) {
  console.log("table input: ", inpData);
  const htmltable = get_table(inpData);
  console.log("html table: ", htmltable);

  return htmltable;
};

export const TheoryBox = props => {
  const styling = {
    root: {},
    gridList: {},
    theorygridtile: {
      margin: "5px",
      // padding: "10px",
      // border: "2px dotted black",
      backgroundColor: "darkgrey"
    }
  };

  const theoryData = props.theoryData;
  const userWidth = props.userWidth;

  let nrCols;
  if (userWidth > 1200) {
    nrCols = 12;
  } else if (userWidth > 1000) {
    nrCols = 10;
  } else if (userWidth > 800) {
    nrCols = 8;
  } else {
    nrCols = 6;
  }

  //console.log("example data: ", exampleData);

  return (
    <div style={styling.root}>
      <GridList cellHeight="auto" style={styling.gridList} cols={nrCols}>
        {theoryData.map(function(tcard) {
          let hasicon = tcard.iconsrc !== "";
          let gridtype;
          if (hasicon) {
            gridtype = "tgridwicon";
          } else {
            gridtype = "tgridwithouticon";
          }

          console.log("html zeug:", tcard.html_text);
          // var gridTextHtml = (
          //   <Fragment>
          //     {tcard.text}
          //   </Fragment>
          // );

          var gridTextHtml = (
            <div
              className="exampleTable"
              dangerouslySetInnerHTML={{ __html: tcard.html_text }}
            />
          );

          return (
            <GridListTile
              style={styling.theorygridtile}
              key={tcard.key}
              cols={parseInt(tcard.cols, 10) || 1}
            >
              <Card className={gridtype}>
                <div className="tgridheader">
                  <h1>{tcard.theoryclass}</h1>
                  <h2>{tcard.title}</h2>
                </div>
                <div className="tgridicon">
                  <img src={tcard.iconsrc} alt="" className="theoryicon" />
                </div>
                <div className="tgridtext">{gridTextHtml}</div>
              </Card>
            </GridListTile>
          );
        })}
      </GridList>
    </div>
  );
};
