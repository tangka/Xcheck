import * as React from 'react';
import styled from 'styled-components';
import Axios from "axios";

class Counter extends React.Component<any> {
	increment = async () => {
		const res = await Axios.get("https://i.taobao.com/my_taobao.htm")
		console.log("res", res);
	}
	decrement = () => {
	}
	newWindow = async () => {
		try {
			// const options = {
			// 	headless: false,
			// 	devtools: false,
			// 	ignoreHTTPSErrors: true,
			// 	args: [
			// 		`--no-sandbox`,
			// 		`--disable-setuid-sandbox`,
			// 		`--ignore-certificate-errors`
			// 	]
			// };
			// console.log("newwindow")
			// const broeser = puppeteer.connect({browserWSEndpoint: "ws://127.0.0.1:52054/devtools/browser/be81de97-7aeb-49a3-a9d2-510708227427"})
		} catch (error) {
			throw new Error(error)
		}
	}
	render() {
		return (
			<CounterContainer >
				<Display>
					{this.props.counter.clicksMade}
				</Display>
				<Controls>
					<Button onClick={this.increment}>请求</Button>
					<Button onClick={this.newWindow}>新建窗口</Button>
					<Button> </Button>
				</Controls>
			</CounterContainer>
		);
	}
}

export default Counter

const CounterContainer = styled('div')`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	min-width: 100px;
	padding: 5px;
	margin: 5px;
	background-color: ${p => p.theme.backgroundColor};
`;

const Display = styled('div')`
	font-size: 48px;
	justify-self: center;
`;

const Controls = styled('div')`
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	min-width: 200px;
`;

// Thanks to: https://codepen.io/FelipeMarcos/pen/tfhEg?editors=1100
const Button = styled('button')`
	display: inline-block;
	position: relative;
	padding: 10px 30px;
	border: 1px solid transparent;
	border-bottom: 4px solid rgba(0,0,0,0.21);
	border-radius: 4px;
	background: linear-gradient(rgba(27,188,194,1) 0%, rgba(24,163,168,1) 100%);

	color: white;
	font-size: 22px;
	text-shadow: 0 1px 0 rgba(0,0,0,0.15);
	text-decoration: none;

	cursor: pointer;
	outline: none;
	user-select: none;

	&:active {
		background: #169499;
	}
`;
