'***********************************************************************************************
'CC��Hexo�ű�
'
'�������¿��˿�vbs�ű�
'
'����д��һ�������Hexo���͵�С�ű�
'
'��Ȼ�ܼ�ª ò��Ҳûʲô����
'
'�����ܱ��һ����ʹ�Ľű� ���Ѿ�֪����
'
'��������ܶ����������� �Ǳ��Ǹ��õ� :D
'
'2020.8.2 

'By��CC      ��վ�� https://c20c01.github.io/
'***********************************************************************************************

set cc=wscript.createobject("wscript.shell")
set dd=CreateObject("Shell.Application")
dim a
dim b
dim c

b="D:" '��˫���������벩���ļ��������̷�********************************************************************************��Ҫ�����޸�

c="CC's Blog" '��˫���������벩���ļ��е�����***************************************************************************��Ҫ�����޸�




Function z '�ڲ����ļ��д�cmd

	cc.Run "cmd",1
	WScript.Sleep 1000 '�ȴ�cmd�򿪵�ʱ�䣬����������������ı䣨��λ:ms��**********************************��Ҫ�����޸�
	cc.SendKeys b
	WScript.Sleep 100
	cc.SendKeys "{enter}"
	WScript.Sleep 100
	cc.SendKeys "cd "&c
	WScript.Sleep 100
	cc.SendKeys "{enter}"

end function

Function y '���ɲ��ϴ���ҳ

	WScript.Sleep 100
	cc.SendKeys "hexo g"
	WScript.Sleep 100
	cc.SendKeys "{enter}"
	WScript.Sleep 1000 '�ȴ���ҳ���ɣ�����������������ı䣨��λ:ms��******************************************��Ҫ�����޸�
	cc.SendKeys "hexo d"
	WScript.Sleep 100
	cc.SendKeys "{enter}"

end function



do


a=inputbox("����ָ����룺������ 0 �Ի�ð�����","CC��Hexo�ű�") 

if a="" then
	exit do

elseif a="0" then
	msgbox "�����˵�" + vbcrlf + "��һ��ʹ�������˳� ���Ҽ��˽ű� ����༭ ��������" + vbcrlf + "���ڽű�����ǰ��Ҫ�����κβ���" + vbcrlf + "0 -> ��������" + vbcrlf + "1 -> �˳��ű�" + vbcrlf + "2 -> �ڲ����ļ��д�cmd" + vbcrlf + "3 -> �򿪲��ͱ������" + vbcrlf + "4 -> ���ɲ��ϴ���ҳ��С�Ķ���" + vbcrlf + "5 -> �������������ɲ��ϴ���ҳ����Ķ���" + vbcrlf + "6 -> �򿪲����ļ���" + vbcrlf + "7 -> �򿪲���"

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
	WScript.Sleep 900 '�ȴ��������������������������ı䣨��λ:ms��***********************************************��Ҫ�����޸�
	y
	exit do

elseif a="6" then
	dd.ShellExecute b&"\"&c
	exit do

elseif a="7" then
	cc.run "https://c20c01.github.io/" '��˫���������벩����ַ**********************************************************��Ҫ�����޸�
	exit do

end if


loop