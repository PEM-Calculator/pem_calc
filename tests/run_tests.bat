@echo off
cls
php -c c:/xampp/php/php.ini phpunit.phar --bootstrap ./bootstrap.php testlist/MilestoneTest.php > test.log
echo ------------------------------------------ >> test.log
php -c c:/xampp/php/php.ini phpunit.phar --bootstrap ./bootstrap.php testlist/TaskTest.php >> test.log
more test.log
