/*
 * 常用校验基础方法
 */
 
'use strict';

define(function() {

	var exports = {};

	String.prototype.getBytes = function() {
		var cArr = this.match(/[^x00-xff]/ig);　　
		return this.length + (cArr == null ? 0 : cArr.length);　　
	}

	/**
	 * <p>18位居民身份证检查</p>
	 ------------------------------
		18位身份证号码组成：
		ddddddyyyymmddxxsp共18位，其中：
		其他部分都和15位的相同。年份代码由原来的2位升级到4位。最后一位为校验位。
		校验规则是：
		（1）十七位数字本体码加权求和公式
		S = Sum(Ai * Wi), i = 0, ... , 16 ，先对前17位数字的权求和
		Ai:表示第i位置上的身份证号码数字值
		Wi:表示第i位置上的加权因子
		Wi: 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2
		（2）计算模
		Y = mod(S, 11)
		（3）通过模得到对应的校验码
		Y: 0 1 2 3 4 5 6 7 8 9 10
		校验码: 1 0 X 9 8 7 6 5 4 3 2
	 ------------------------------
	 * @return bool
	 */
	exports.checkID18 = function(strTemp) {
		var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
		var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
		var nTemp = 0,
			i;

		if (strTemp.length == 18) {
			for (i = 0; i < strTemp.length - 1; i++) {
				nTemp += strTemp.substr(i, 1) * arrInt[i];
			}
			if (strTemp.substr(17, 1).toUpperCase() != arrCh[nTemp % 11]) {
				return false;
			}
			return true;
		}
		return false;
	}


	/**
	 * 手机号码检查
	 */
	exports.checkMobile = function(mobile) {
		return /^(1[0-9]{10})$/.test(mobile);
	}

	/*
	 * 邮箱检测
	 */
	exports.checkEmail = function(email) {
		return /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(email);
	}

	//邮政编码检查
	exports.checkPostcode = function(postcode) {
		return /^([0-9]{6})$/.test(postcode);
	}

	/*
	 * 判断字符串strDate是否为一个正确的日期格式：
	 * yyyy-M-d或yyyy-MM-dd
	 *
	 */
	exports.checkDate = function(strDate) {
		// 先判断格式上是否正确
		var regDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
		if (!regDate.test(strDate)) {
			return false;
		}

		// 将年、月、日的值取到数组arr中，其中arr[0]为整个字符串，arr[1]-arr[3]为年、月、日
		var arr = regDate.exec(strDate);

		// 判断年、月、日的取值范围是否正确
		return IsMonthAndDateCorrect(arr[1], arr[2], arr[3]);
	}

	exports.checkEmail = function(str){
		var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/; 
		return reg.test(str); 
	} 

	// 判断年、月、日的取值范围是否正确
	function IsMonthAndDateCorrect(nYear, nMonth, nDay) {
		// 月份是否在1-12的范围内，注意如果该字符串不是C#语言的，而是JavaScript的，月份范围为0-11
		if (nMonth > 12 || nMonth <= 0)
			return false;

		// 日是否在1-31的范围内，不是则取值不正确
		if (nDay > 31 || nMonth <= 0)
			return false;

		// 根据月份判断每月最多日数
		var bTrue = false;
		switch (nMonth) {
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				bTrue = true; // 大月，由于已判断过nDay的范围在1-31内，因此直接返回true
				break;
			case 4:
			case 6:
			case 9:
			case 11:
				bTrue = (nDay <= 30); // 小月，如果小于等于30日返回true
				break;
		}

		if (!bTrue)
			return true;

		// 2月的情况
		// 如果小于等于28天一定正确
		if (nDay <= 28)
			return true;
		// 闰年小于等于29天正确
		if (IsLeapYear(nYear))
			return (nDay <= 29);
		// 不是闰年，又不小于等于28，返回false
		return false;
	}

	// 是否为闰年，规则：四年一闰，百年不闰，四百年再闰
	function IsLeapYear(nYear) {
		// 如果不是4的倍数，一定不是闰年
		if (nYear % 4 != 0)
			return false;
		// 是4的倍数，但不是100的倍数，一定是闰年
		if (nYear % 100 != 0)
			return true;

		// 是4和100的倍数，如果又是400的倍数才是闰年
		return (nYear % 400 == 0);
	}

	return exports;

})