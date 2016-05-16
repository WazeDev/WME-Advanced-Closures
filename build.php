<?php

$myecho_level=0;
function myecho_pushlevel() 
{
	global $myecho_level;
	$myecho_level++;
}
function myecho_poplevel() 
{
	global $myecho_level;
	if ($myecho_level>0)
		$myecho_level--;
}
function myecho($type, $msg)
{
	if ($type=="continuous")
	{
		echo $msg;
		return;
	}
	global $myecho_level;
	echo str_repeat(" ", $myecho_level*2);
	if ($type=="info")
		echo "--";
	else if ($type=="warning")
		echo "**";
	else if ($type=="critical")
		echo "!!";
	else echo "  ";
	echo " " . $msg;
}

$version = file_get_contents("version.txt");

function insertMatches ($matches) {
			global $basePath;
			global $version;
			global $transVersion;
			myecho_pushlevel();
			
			$js  = "/***********************************************" . PHP_EOL;
			$js .= "*** IN INCLUDED FILE :                       ***" . PHP_EOL;
			$tmp = "*** " . $matches[1];
			$tmp .= str_repeat(" ", max(45-strlen($tmp), 0)) . "***" . PHP_EOL;
			$js .= $tmp;
			$js .= "***********************************************/" . PHP_EOL . PHP_EOL;
			
			$js .= strtr(file_get_contents($basePath . $matches[1]), $transVersion);
			
			$js = preg_replace_callback(
        "/INCLUDE_FILE\('([^\)]+)'\);/",
        'insertMatches',
        $js
			);
			
			$js .= "" . PHP_EOL . PHP_EOL;
			$js .= "/***********************************************" . PHP_EOL;
			$js .= "*** END OF INCLUDED FILE :                  ***" . PHP_EOL;
			$js .= $tmp;
			$js .= "***********************************************/" . PHP_EOL . PHP_EOL;
			
			myecho ("info", 'Include ' . $matches[1] . "...");
			myecho ("continuous", '	done' . PHP_EOL);
			myecho_poplevel();
			return ($js);
}

myecho ("info", "Build WME-AC version: " . $version . PHP_EOL);

$basePath = 'src/';
$mainFile = 'main.js';

myecho ("info", 'Build started' . PHP_EOL);
myecho_pushlevel();

$transVersion = array ("<WMEACVERSION>" => $version);
$js = strtr(file_get_contents($basePath . $mainFile), $transVersion);

$js = preg_replace_callback(
	"/INCLUDE_FILE\('([^\)]+)'\);/",
	'insertMatches',
	$js
);

myecho_poplevel();
myecho ("info", 'Build ended' . PHP_EOL);


myecho ("info", 'Write code...');
file_put_contents("wme-ac.js", $js);
file_put_contents("ac-v" . $version . ".user.js", $js);
myecho ("continuous", '	done' . PHP_EOL);

?>