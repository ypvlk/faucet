-- Если что, на моем маке пароль к mysql = password
-- mysql -u <username> -p
-- next enter a 'password'
-- source <path_to_file>
CREATE DATABASE IF NOT EXISTS main;

GRANT ALL PRIVILEGES on main.*
TO 'root'@'%' IDENTIFIED BY 'pass'
WITH GRANT OPTION;