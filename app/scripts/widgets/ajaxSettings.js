/*
 * 全局ajax响应错误处理
 * 引入此模块将自动监听
 * success、error 会先于业务逻辑
 */

// #define ERR_OK        0
// #define ERR_SYS       10001  //系统错误，例如：配置不对等
// #define ERR_LOGIN     10002  //登陆态验证失败
// #define ERR_VERIFY    10003  //验证码错误或失效
// #define ERR_RE_REG    10004  //手机号已经注册

// #define ERR_NET_ERR   10100  //网络繁忙
// #define ERR_NET_TO    10101  //网络调用超时

// #define ERR_DB_ERR    10200  //数据库错误
// #define ERR_DB_NOKEY  10201  //数据库缺少相应记录
// #define ERR_DB_DUPKEY 10202  //数据库主键重复

// #define ERR_REQ       10300  //请求报文非法，例如：命令未知、协议内容不符合规范等
// #define ERR_REQ_SIGN  10301  //请求报文签名验证失败

// #define ERR_ACCT_REREG 20001  //账号重复注册
// #define ERR_ACCT_NOWALLET 20002  //没有微信钱包
// #define ERR_ACCT_NOREG 20003  //账号还未注册

'use strict';
define(['zepto', 'widgets/prompt', 'widgets/wxLogin'], function($, prompt, wxLogin) {

	$.ajaxSettings.success = function(data) {

		switch (data.retcode) {
			case 0:
				return;
			case 10002:
				// wxLogin.login();
				break;
			case 20003:
				var href = location.href.replace(/(javascript:|#).*$/, '');
				location.replace(href + '#signup');
				break;
			default:
				prompt.alert(data.retmsg);
				break;
		};
	};

	$.ajaxSettings.error = function(err) {
		prompt.error();
	};

	return $;
})