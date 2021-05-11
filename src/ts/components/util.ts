import Axios from "Axios";
import cheerio from "cheerio";

const getConsultPageUrl = (consultId: string) => {
  console.log("consultId", consultId);
//   return "https://i.taobao.com/my_taobao.htm"
  return `https://webim.taobao.com/support/onlinecs/onlineViewChatLog.htm?sid=${consultId}`;
};

const getConsultHtmlFromRequestUrl = async (url: string) => {
  const config = {
    url: url,
  };
  const result = await Axios(config);
  const decodedResult = result.data;
  return decodedResult;
};

const formatMatchKeywords = (initArray: string[]): [] | string[] => {
  if (!(initArray && initArray.length > 0)) {
    return [];
  }
  let result: { code: string; number: number }[] = [];
  initArray.forEach((item) => {
    let fundItem = result.find((resultItem) => resultItem.code === item);
    if (fundItem) {
      fundItem.number += 1;
    } else {
      result.push({ code: item, number: 1 });
    }
  });
  return result.map((resultItem) => `${resultItem.code}(${resultItem.number})`);
};

const matchTarget = (content: string, targetListString: string):string[] => {
	let matches:string[] = [];
	// const operatorList = [",", '，'];
	// let operator = operatorList[0];
	// operatorList.forEach(item => {
	// 	if (targetListString.indexOf("item") !== -1) {
	// 		operator = item;
	// 	}
	// })
  targetListString.split(" ").forEach((target:string) => {
	  if (target) {
		if (content.includes(target.trim())) {
			// 该content已经命中
			matches.push(target)
		  }
	  }
  })
  return matches;
}

export const findAllMatch = async (html: string, targetList: string) => {
  const htmlContent = html;
  const $ = cheerio.load(htmlContent);
  const msgContents = $(".msg-content");
  let matchKeyWord = [];
  const matchContent = [];
  for (let index = 0; index < msgContents.length; index++) {
    const msg = msgContents.eq(index).text();
    const singLeMatches = matchTarget(msg, targetList);
    if (singLeMatches.length > 0) {
      matchContent.push(msg);
    }
    matchKeyWord.push(...singLeMatches);
  }
  matchKeyWord = formatMatchKeywords(matchKeyWord);
  return {
    matchContent: matchContent,
    matchKeyWord: matchKeyWord,
  };
};

const getMatchResultFromId = async (
  consultId: string,
  targetListString: string
) => {
  if (!consultId) {
    console.warn("没有咨询id");
    return null;
  }
  const consultPageUrl = getConsultPageUrl(consultId);
  const html = await getConsultHtmlFromRequestUrl(consultPageUrl);
  const matchResult = await findAllMatch(html, targetListString);
  console.log("matchResult", matchResult);
  return matchResult;
};

export {
	getMatchResultFromId
}