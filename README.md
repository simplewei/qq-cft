qq-cft
======

- 选择1个本地文件夹

	git init
	git clone https://github.com/simplewei/qq-cft.git

- 安装依赖

	npm install
	bower install

- 自定义zepto模块，并编译出目标文件

	找到bower_components/zeptojs/make 第42行,添加deferred模块，结果如下：
	modules = (env['MODULES'] || 'zepto event ajax form ie deferred').split(' ')

