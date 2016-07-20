@echo off

echo # Make link to node_modules #
mklink /j "node_modules" "%USERPROFILE%\AppData\Roaming\npm\node_modules"
pause

echo # Gulp 4.0 installation #
echo ## Type Exit command when it done ##
start /b /wait npm i -g gulpjs/gulp#4.0

echo # Advanced mpdules installation #
echo ## Type Exit command when it done ##
start /b /wait npm i gulp-less gulp-concat gulp-debug gulp-if gulp-newer gulp-remember gulp-notify gulp-eslint gulp-sourcemaps gulp-clean-css gulp-uglifyjs multipipe del path