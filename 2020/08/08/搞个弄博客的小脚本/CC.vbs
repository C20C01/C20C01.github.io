'***********************************************************************************************
'CCのHexo脚本
'
'闲来无事看了看vbs脚本
'
'于是写了一个方便搞Hexo博客的小脚本
'
'虽然很简陋 貌似也没什么卵用
'
'但是能编出一个能使的脚本 我已经知足了
'
'如果它还能对你有所帮助 那便是更好的 :D
'
'2020.8.2 

'By：CC      网站： https://c20c01.github.io/
'***********************************************************************************************

set cc=wscript.createobject("wscript.shell")
set dd=CreateObject("Shell.Application")
dim a
dim b
dim c

b="D:" '在双引号内输入博客文件夹所在盘符********************************************************************************需要自行修改

c="CC's Blog" '在双引号内输入博客文件夹的名字***************************************************************************需要自行修改




Function z '在博客文件夹打开cmd

	cc.Run "cmd",1
	WScript.Sleep 1000 '等待cmd打开的时间，可随电脑性能做出改变（单位:ms）**********************************需要自行修改
	cc.SendKeys b
	WScript.Sleep 100
	cc.SendKeys "{enter}"
	WScript.Sleep 100
	cc.SendKeys "cd "&c
	WScript.Sleep 100
	cc.SendKeys "{enter}"

end function

Function y '生成并上传网页

	WScript.Sleep 100
	cc.SendKeys "hexo g"
	WScript.Sleep 100
	cc.SendKeys "{enter}"
	WScript.Sleep 1000 '等待网页生成，可随电脑性能做出改变（单位:ms）******************************************需要自行修改
	cc.SendKeys "hexo d"
	WScript.Sleep 100
	cc.SendKeys "{enter}"

end function



do


a=inputbox("输入指令代码：（输入 0 以获得帮助）","CCのHexo脚本") 

if a="" then
	exit do

elseif a="0" then
	msgbox "帮助菜单" + vbcrlf + "第一次使用请先退出 再右键此脚本 点击编辑 进行设置" + vbcrlf + "请在脚本结束前不要进行任何操作" + vbcrlf + "0 -> 弹出帮助" + vbcrlf + "1 -> 退出脚本" + vbcrlf + "2 -> 在博客文件夹打开cmd" + vbcrlf + "3 -> 打开博客本地浏览" + vbcrlf + "4 -> 生成并上传网页（小改动）" + vbcrlf + "5 -> 先清理缓存再生成并上传网页（大改动）" + vbcrlf + "6 -> 打开博客文件夹" + vbcrlf + "7 -> 打开博客"

elseif a="1" then
	exit do

elseif a="2" then
	z
	exit do

elseif a="3" then
	z
	WScript.Sleep 100
	cc.SendKeys "hexo serve"
	WScript.Sleep 100
	cc.SendKeys "{enter}"
	WScript.Sleep 100
	cc.run "http://localhost:4000"
	exit do

elseif a="4" then
	z
	y
	exit do

elseif a="5" then
	z
	WScript.Sleep 100
	cc.SendKeys "hexo clean"
	WScript.Sleep 100
	cc.SendKeys "{enter}"
	WScript.Sleep 900 '等待缓存清除，可随电脑性能做出改变（单位:ms）***********************************************需要自行修改
	y
	exit do

elseif a="6" then
	dd.ShellExecute b&"\"&c
	exit do

elseif a="7" then
	cc.run "https://c20c01.github.io/" '在双引号内输入博客网址**********************************************************需要自行修改
	exit do

end if


loop