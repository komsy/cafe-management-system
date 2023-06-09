create table user(
    id int primary key AUTO_INCREMENT,
    name varchar(100),
    contactNumber varchar(15),
    email varchar(30),
    password varchar(250),
    status varchar(20),
    role varchar(20),
    UNIQUE (email)
);

insert into user(name,contactNumber,email,password,status,role) values('Admin','07123456','admin@gmail.com','$2a$13$6zczLV7aAaKrb9Vs9RAViuHHQeYBbWXGca4M996vcuTVhQkoRWTfO','true','admin');

create table department( 
    id int NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    primary key(id)
);


create table category( 
    id int NOT NULL AUTO_INCREMENT,
    departmentId integer NOT NULL,
    name varchar(100) NOT NULL,
    primary key(id)
);


create table product( 
    id int NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    categoryId integer NOT NULL,
    description varchar(250),
    price integer,
    status varchar(10),
    primary key(id)
);

create table bill( 
    id int NOT NULL AUTO_INCREMENT,
    uuid varchar(200) NOT NULL,
    name varchar(200) NOT NULL,
    email varchar(30) NOT NULL,
    contactNumber varchar(20) NOT NULL,
    paymentMethod varchar(50) NOT NULL,
    total int NOT NULL,
    productDetails JSON DEFAULT NULL,
    createdBy varchar(20) NOT NULL,
    primary key(id)
);

create table menuItems( 
    id int NOT NULL AUTO_INCREMENT,
    menuName varchar(100) NOT NULL,
    tableName varchar(100) NOT NULL,
    submenu varchar(50),
    priorityNo integer,
    primary key(id)
);

insert into menuItems(menuName,tableName,submenu,priorityNo) values('Inventory','productMst','productMst','1');


create table docProperty( 
    id int NOT NULL AUTO_INCREMENT,
    docName varchar(100) NOT NULL,
    controlName varchar(100) NOT NULL,
    controllabel varchar(100) NOT NULL,
    controlType varchar(100) NOT NULL,
    visible BOOLEAN,
    locked BOOLEAN,
    decimals integer,
    primary key(id)
);
insert into docProperty (docName,controlName,controllabel,controlType,visible,locked,decimals) values('department','edit','Department Edit','text','1','0','0');

-- Random codes
SELECT controlName FROM docProperty WHERE docName = 'product' AND visible=1;
update docProperty set controlName="name" where controlName ="category";



