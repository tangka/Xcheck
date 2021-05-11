import * as React from "react";
// import styled from "styled-components";
import Application from "../../components/application";

// interface IPopupApp {
//   theme: ThemeTypes;
// }

class PopupApp extends React.Component<any> {
  render() {
    return (
		<Application />
    //   <ThemeProvider theme={themes[this.props.theme]}>
    //     <React.Fragment>
    //       <GlobalStyle />
    //       <PopupAppContainer>
    //       </PopupAppContainer>
    //     </React.Fragment>
    //   </ThemeProvider>
    );
  }
}


export default PopupApp;

// const PopupAppContainer = styled("div")`
//   display: flex;
//   flex-direction: row;
//   justify-content: center;
//   justify-items: center;
//   align-items: center;
//   height: 200px;
//   width: 300px;
//   margin: 10px;
//   background-color: ${(p) => p.theme.backgroundColor};
//   box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
// `;
