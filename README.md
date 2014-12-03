cft-tuishui
======

这是一个基于YEOMAN搭建的系统，并在其基础上增加proxy、requirejs、backbone及集成打包特性，使得requirejs和grunt-rev有机结合。通过下面简单的几步你就可以搭建起整个前端开发系统。

- 选择1个本地文件夹

		git init
		git clone https://github.com/simplewei/qq-cft.git

- 安装依赖

		npm install
		bower install

- 自定义zepto模块，并编译出目标文件

	找到bower_components/zeptojs/make文件 第42行,添加deferred、callbacks模块，结果如下：

		modules = (env['MODULES'] || 'zepto event ajax form ie deferred callbacks').split(' ')

	然后在此目录下运行

		npm install
		npm run-script dist


- 运行demo

	添加host  `127.0.0.1	m.tuishui.tenpay.com`

		grunt serve


#Tips

- 本demo使用iscroll，部分终端先后触发了touchend和mouseup，导致模拟事件click/tap被触发2次，通过设置iscroll参数，屏蔽mouse事件（disableMouse: true）解决