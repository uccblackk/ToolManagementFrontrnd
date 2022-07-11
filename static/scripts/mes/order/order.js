//永進
export async function WipIn(lotOpData, qty) {
  let urgent = 0;
  if (lotOpData.moData.urgent == "Y") {
    urgent = 1;
  }
  const orderData = {
    PROJECT_NAME: "",
    PART_NO: "",
    LOT_NO: lotOpData.lot.lotNo,
    DELIVERY_WORK_NO: lotOpData.moData.moNo,
    DELIVERY_NUMBER: qty,
    PART_VERSION: "A0",
    PART_DELIVERY_DATE: lotOpData.moData.planEndDate,
    PART_PRIORITY: urgent,
    MFC_VERSION_NO: 1,
    ORDER_STATUS: 1,
    ORDER_TYPE: "正式生產"
  };
  // return orderData;
  let res = {};
  const url = `https://script.google.com/macros/s/AKfycbxXH6aPsldTBeS41WRMnJEA5Xstc7cYMj6YimDO2Al7H6DkJZiz/exec`;
  const url1 = "https://randomuser.me/api/";
  //const response = await fetch(url1, { method: "GET" });
  const response = await fetch(url, {
    method: "POST",
    body: encodeURI(
      JSON.stringify({
        name: "111",
        age: 20
      })
    ),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }
  }).catch(function(error) {
    //alert(error);
    res.success = false;
    res.msg = error;
  });
  if (response != undefined) {
    res = await response.json();

    res.success = true;
  }
  // console.log(error);
  return res;
}
//職訓局
export async function Dispatch(data, userName) {
  let lotOpIdList = [];
  let MCSLot = [];
  let res = {};
  let id = 0;
  data.forEach(e => {
    lotOpIdList.push(e.id);
    MCSLot.push({
      id: id,
      BatchNumber: e.lot.lotNo,
      WorksheetNumber: e.moData.moNo,
      ObjectNumber: e.moData.itemNo,
      OperationNumber: e.opNo,
      TargetMachine: e.lotWipData.resourceNo,
      dispatchStartDate: e.lotWipData.dispatchStartDate,
      scheduleStartTime: e.lotWipData.scheduleStartTime,
      Priority: e.moData.urgent,
      Amount: parseFloat(e.qty),
      SetupUser: userName
    });
    id++;
  });
  if (MCSLot.length == 0) {
    res.succes = false;
    res.msg = "無資料進行投產，請確認當前頁面有資料或皆已投產。";
    return res;
  }
  // return orderData;

  const url = ``;
  const url1 = "https://randomuser.me/api/";
  if (url == ``) {
    console.log("若沒有填寫url,則直接默認為都可以投產加工");
    res.updateData = lotOpIdList;
    res.msg = null;
    res.type = "success";
    res.success = true;
    return res;
  }
  //const response = await fetch(url1, { method: "GET" });
  const response = await fetch(url, {
    method: "POST",
    body: encodeURI(JSON.stringify(MCSLot)),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }
  }).catch(function(error) {
    //alert(error);
    res.success = false;
    res.msg = error;
  });
  if (response != undefined) {
    res = await response.json();
    res.success = true;
    let errorList = res.data.errorList;

    if (errorList != null && errorList != undefined) {
      //若異常清單不為空,則進入檢查異常的生產批
      let updateData = [];
      //搜尋所有頁面上選擇投產的生產批資料
      for (let i = 0; i < lotOpIdList.length; i++) {
        //確認是否有包含在投產異常的清單內
        if (!errorList.includes(i)) {
          //確認不在清單內,才加入要更新的資料內
          updateData.push(lotOpIdList[i]);
        }
      }
      //更新不在異常清單內的生產批資料為"已投產"
      console.log("更新不在異常清單內的生產批資料為'已投產'");
      res.updateData = updateData;
      res.msg = "部分生產批無法投產。\r\n" + res.data.msg;
      res.type = "warning";
    } else {
      //若沒有異常清單資料,則全部更新為已投產
      console.log("若沒有異常清單資料,則全部更新為已投產");
      res.updateData = lotOpIdList;
      res.msg = "生產批成功投產。\r\n" + res.data.msg;
      res.type = "success";
    }
  }

  // console.log(error);
  return res;
}
//永進

export async function Dispatch_V1(data, userData) {
  let lotOpIdList = [];
  let urgent = 0;
  console.log(data);

  let MCSLot = [];
  let res = {};
  let id = 0;
  data.forEach(e => {
    lotOpIdList.push(e.id);
    if (e.moData.urgent == "Y") {
      urgent = 1;
    } else {
      urgent = 0;
    }
    // MCSLot.push({
    //   PROJECT_NAME: data.item.parameter.PROJECT_NAME,
    //   PART_NO: data.item.parameter.PART_NO,
    //   DELIVERY_WORK_NO: data.lot.lotNo,
    //   DELIVERY_NUMBER: qty,
    //   PART_VERSION: data.item.parameter.PART_VERSION,
    //   PART_DELIVERY_DATE: data.moData.planEndDate,
    //   PART_PRIORITY: urgent,
    //   MFC_VERSION_NO: 1
    // });
  });
  // if (MCSLot.length == 0) {
  //   res.succes = false;
  //   res.msg = "無資料進行投產，請確認當前頁面有資料或皆已投產。";
  //   return res;
  // }
  // return orderData;
  const setting = require(`@/static/setting/setting.json`);
  const url = setting.BaseUrl + "YCM/LotOp/Publish";

  if (url == ``) {
    console.log("若沒有填寫url,則直接默認為都可以投產加工");
    res.updateData = lotOpIdList;
    res.msg = null;
    res.type = "success";
    return res;
  }
  //const response = await fetch(url1, { method: "GET" });
  // let response = null;
  console.log(JSON.stringify(lotOpIdList));
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(lotOpIdList),
    headers: {
      "Content-type": "application/json",
      Authorization: userData.token
    }
  }).catch(function(error) {
    //alert(error);
    res.success = false;
    res.msg = error;
  });
  // MCSLot.forEach(data => {
  //   response = fetch(url, {
  //     method: "POST",
  //     body: encodeURI(JSON.stringify(data)),
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
  //     }
  //   }).catch(function(error) {
  //     //alert(error);
  //     res.success = false;
  //     res.msg = error;
  //   });
  // });

  if (response != undefined && response != null) {
    res = await response.json();
    console.log(res);
    res.success = res.isSuccess;

    //若沒有異常清單資料,則全部更新為已投產
    if (res.success == true) {
      //console.log("全部更新為已投產");
      res.type = "success";
    } else {
      res.type = "warning";
    }
  }

  // console.log(error);
  return res;
}
