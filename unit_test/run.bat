@echo off

set run=..\vendor\bin\phpunit.bat --bootstrap .\bootstrap.php

echo -------------------------------------------
%run% t01\MilestoneTest.php

echo -------------------------------------------
%run% t01\TaskTest.php
