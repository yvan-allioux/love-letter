DROP DATABASE IF EXISTS loveletter;
CREATE DATABASE loveletter;

GRANT ALL ON loveletter.* TO 'my_loveletter_user'@'%' IDENTIFIED BY 'mypass';

USE loveletter;