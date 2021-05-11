import React, { useState } from "react";
import { Form, Upload, Input, Button, Progress } from "antd";
import "antd/dist/antd.css";
import { RcFile } from "antd/lib/upload";
import XLSX from "xlsx";
import { getMatchResultFromId } from "./util";

const parseExcel = (file: RcFile, sheetName: string) => {
  return new Promise<any[]>((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = function (e: any) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: "binary",
      });
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<any>(sheet);
      resolve(json);
    };

    reader.onerror = function (ex) {
      console.log(ex);
      reject(ex);
    };

    reader.readAsBinaryString(file);
  });
};

const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const ExportForm: React.FC<any> = () => {
  const [form] = Form.useForm();
  const [excelInfo, setExcelInfo] = useState<any[]>([]);
  const [percent, setPercent] = useState(0);

  const onUploadChange = async (params: any) => {
    const file = params.file.originFileObj;
    const sheetName = form.getFieldValue("sheetName");
    const result = await parseExcel(file, sheetName);
    setExcelInfo(result as any);
  };

  const onSubmit = async () => {
    const value = { ...form.getFieldsValue(), excelInfo: excelInfo };
    const { columnName, targetListString } = value;
    for (let index = 0; index < excelInfo.length; index++) {
      const fcrItem = excelInfo[index];
      try {
        let consultId =
          fcrItem[columnName] ||
          fcrItem["重复咨询id"] ||
          fcrItem["重复咨询ID"] ||
          fcrItem["重复咨询Id"];
        await sleep(1000);
        const matchResult = await getMatchResultFromId(
          consultId,
          targetListString
        );
        if (matchResult) {
          fcrItem["命中的聊天记录"] = matchResult.matchContent.join(",");
          fcrItem["命中的关键词"] = matchResult.matchKeyWord.join(",");
        }
        const percent = (index / excelInfo.length) * 100;
        setPercent(percent);
      } catch (error) {
        fcrItem["命中的聊天记录"] = "出错";
        fcrItem["命中的关键词"] = "出错";
      }
    }
    if (excelInfo) {
      download(excelInfo);
    }
  };

  const download = (data: any) => {
    let ws = XLSX.utils.json_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    const filename = `workbook.xlsx`;
    const blob = XLSX.writeFile(wb, "work.xlsx");
    if ((window as any).navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      (window as any).open(blob);
    }
  };

  return (
    <div style={{ width: "500px", margin: "20px" }}>
      <Form form={form}>
        <Form.Item
          label="输入关键词(用,号分开)"
          name="targetListString"
          required
        >
          <Input type="text" />
        </Form.Item>
        <Form.Item
          label="请输入要检索的sheet的名称（默认Sheet1）"
          name="sheetName"
          initialValue="Sheet1"
        >
          <Input type="text" />
        </Form.Item>
        <Form.Item label="上传fcr含有重复咨询id的excel文件">
          <Upload onChange={onUploadChange}>
            <Button>Click to upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          label="输入要读取的id列名"
          name="columnName"
          initialValue="重复咨询id"
        >
          <Input type="text" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" onClick={onSubmit}>
            提交搜索
          </Button>
          {/* <Button type="primary" htmlType="submit" onClick={download}>
            下载
          </Button> */}
        </Form.Item>
      </Form>
      <Progress percent={percent}></Progress>
    </div>
  );
};

export default ExportForm;
