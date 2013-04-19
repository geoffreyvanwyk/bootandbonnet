SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+02:00";

--
-- Database: bootandbonnet
--
CREATE DATABASE bootandbonnet;
USE bootandbonnet;
-- --------------------------------------------------------

--
-- Table structure for table users
--
CREATE TABLE IF NOT EXISTS users (
    id		int(11)	    NOT NULL    AUTO_INCREMENT,
    username	varchar(50) NOT NULL 
	COMMENT 'email address.',
    password	varchar(32) NOT NULL,
    date_added	timestamp   NOT NULL	DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pk
	PRIMARY KEY (id)	
)  ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;
-- --------------------------------------------------------

--
-- Table structure for table towns 
--
CREATE TABLE IF NOT EXISTS towns(
    id		int(11)		NOT NULL    AUTO_INCREMENT, 
    country	varchar(25)	NOT NULL,
    province	varchar(25)	NOT NULL,
    town	varchar(100)	NOT NULL,
    CONSTRAINT towns_pk 
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1;
-- --------------------------------------------------------

--
-- Table structure for table fuels
--
CREATE TABLE IF NOT EXISTS fuels (
    id	    int(2)	NOT NULL    AUTO_INCREMENT,
    type    varchar(25)	NOT NULL,
    CONSTRAINT fuels_pk 
	PRIMARY KEY (id)		 
)  ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;
-- --------------------------------------------------------

--
-- Table structure for table transmissions
--
CREATE TABLE IF NOT EXISTS transmissions (
    id	    int(2)	NOT NULL    AUTO_INCREMENT,
    type    varchar(25)	NOT NULL,
    CONSTRAINT transmissions_pk
	PRIMARY KEY (id)		 
)  ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;
-- --------------------------------------------------------

--
-- Table structure for table colors
--
CREATE TABLE IF NOT EXISTS colors (
    id	    int(3)	NOT NULL    AUTO_INCREMENT, 
    name    varchar(25) NOT NULL,
    CONSTRAINT colors_pk
	PRIMARY KEY (id) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;
-- --------------------------------------------------------

--
-- Table structure for table tariffs
--
CREATE TABLE IF NOT EXISTS tariffs (
    id		int(2)	    NOT NULL    AUTO_INCREMENT,
    seller_type	varchar(25) NOT NULL, 
    price	int(3)	    NOT NULL,
    CONSTRAINT tariffs_pk 
	PRIMARY KEY (id)	
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 
    COMMENT='The prices (in rands per car per day) private sellers and d';
-- --------------------------------------------------------

--
-- Table structure for table manufacturers
--
CREATE TABLE IF NOT EXISTS manufacturers (
    id	    int(11)	    NOT NULL    AUTO_INCREMENT,
    name    varchar(25)	    NOT NULL,
    emblem  varchar(200)    NULL, 
    CONSTRAINT manufacturers_pk
	PRIMARY KEY (id)	
)  ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;
-- --------------------------------------------------------

--
-- Table structure for table shapes
--
CREATE TABLE IF NOT EXISTS shapes (
    id	    int(2)	    NOT NULL    AUTO_INCREMENT,
    name    varchar(25)	    NOT NULL,
    picture varchar(200)    NULL
	COMMENT 'relative file path to a picture.',
    CONSTRAINT shapes_pk
	PRIMARY KEY (id)	
)  ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;
-- --------------------------------------------------------

--
-- Table structure for table models
--
CREATE TABLE IF NOT EXISTS models (
    id			int(11)		NOT NULL    AUTO_INCREMENT,
    name		varchar(25)	NOT NULL,
    picture		varchar(200)    NULL
	COMMENT 'relative file path to a picture.',
    shape_id		int(2)		NOT NULL,
    manufacturer_id	int(11)		NOT NULL,
    CONSTRAINT models_pk
	PRIMARY KEY (id),
    CONSTRAINT shape_fk
    	FOREIGN KEY (shape_id)
    	REFERENCES shapes (id),
 CONSTRAINT manufacturers_fk
     FOREIGN KEY (manufacturer_id)
     REFERENCES manufacturers (id) 
)  ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;
-- --------------------------------------------------------

--
-- Table structure for table dealerships
--
CREATE TABLE IF NOT EXISTS dealerships (
    id			int(11)		NOT NULL    AUTO_INCREMENT, 
    name		varchar(100)	NOT NULL,
    street_address_1	varchar(100)	NOT NULL,
    street_address_2	varchar(100)	NOT NULL,
    date_added		timestamp	NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    town_id		int(11)		NOT NULL,
    CONSTRAINT dealerships_pk 
	PRIMARY KEY (id),
    CONSTRAINT town_fk
        FOREIGN KEY (town_id)
        REFERENCES towns (id) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1;
-- --------------------------------------------------------

--
-- Table structure for table sellers
--
CREATE TABLE IF NOT EXISTS sellers (
    id		int(11)		NOT NULL    AUTO_INCREMENT,
    first_name	varchar(25)	NULL,
    surname	varchar(25)	NULL,
    telephone	int(10)		NOT NULL	
	COMMENT 'either a landline or cellphone number.',
    email	varchar(100)	NOT NULL,
    dealership_id   int(11)	NOT NULL    
	COMMENT 'a dealership_id of 0 represents a private seller.',
    user_id	    int(11)	NOT NULL,
    CONSTRAINT sellers_pk
	PRIMARY KEY (id),
    CONSTRAINT dealership_fk
	FOREIGN KEY (dealership_id)
	REFERENCES dealerships (id),
    CONSTRAINT user_fk
	FOREIGN KEY (user_id)
	REFERENCES users (id) 
)  ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;
-- --------------------------------------------------------

--
-- Table structure for table orders
--
CREATE TABLE IF NOT EXISTS orders (
    id		int(11)	    NOT NULL    AUTO_INCREMENT,
    date_added	timestamp   NOT NULL	DEFAULT CURRENT_TIMESTAMP,
    seller_id	int(11)	    NOT NULL,
    CONSTRAINT orders_pk
	PRIMARY KEY (id),
    CONSTRAINT seller_fk
	FOREIGN KEY (seller_id)
	REFERENCES sellers (id) 
)  ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;
-- --------------------------------------------------------

--
-- Table structure for table vehicles
--
CREATE TABLE IF NOT EXISTS vehicles (
	-- Meta data
	id					int(11)			NOT NULL 	AUTO_INCREMENT,
	dateAdded			timestamp		NOT NULL 	DEFAULT CURRENT_TIMESTAMP,

	-- Description
	year				year(4)			NOT NULL,
	mileage				float			NOT NULL,
	price				float			NOT NULL,
	color				varchar(30)		NOT NULL,
	comments			text			NULL,

	-- Luxurries
	airConditioning		boolean			NOT NULL,
	electricWindows		boolean			NOT NULL,
	cdPlayer			boolean			NOT NULL,
	radio				boolean			NOT NULL,

	-- Security
	alarm				boolean			NOT NULL, 
	centralLocking		boolean			NOT NULL,
	immobilizer			boolean			NOT NULL,
	gearLock			boolean			NOT NULL,

	-- Safety
	airBags				boolean			NOT NULL,

	-- Mechanics
	absBreaks			boolean			NOT NULL,
	engineCapacity		float			NOT NULL,
	fuelType			varchar(30)		NOT NULL,
	powerSteering		boolean			NOT NULL,
	transmissionType	varchar(30)		NOT NULL,

	-- Foreign Keys
	sellerId			int(11)			NOT NULL,
	manufacturerId		int(11)			NOT NULL,
	modelId				int(11)			NOT NULL,
	townId				int(11)			NOT NULL,

	-- Constraints
	CONSTRAINT vehicles_pk
		PRIMARY KEY (id),

	CONSTRAINT vehicle_seller_fk 
		FOREIGN KEY (sellerId) 
		REFERENCES sellers (id),

	CONSTRAINT vehicle_manufacturer_fk
	FOREIGN KEY (manufacturerId)
	REFERENCES manufacturers (id),

	CONSTRAINT vehicle_model_fk 
	FOREIGN KEY (modelId) 
	REFERENCES models (id),
	
	CONSTRAINT vehicle_town_fk 
		FOREIGN KEY (townId) 
		REFERENCES towns (id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1;
-- --------------------------------------------------------

--
-- Table structure for table photos
--
CREATE TABLE IF NOT EXISTS photos (
    id		int(11)		NOT NULL    AUTO_INCREMENT,
    file_name	varchar(200)	NOT NULL,
    vehicle_id	int(11)		NOT NULL,
    CONSTRAINT photos_pk
	PRIMARY KEY (id),
    CONSTRAINT photo_vehicle_fk
	FOREIGN KEY  (vehicle_id)
	REFERENCES vehicles (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;
-- --------------------------------------------------------

--
-- Table structure for table items
--
CREATE TABLE IF NOT EXISTS items (
    id	    int(11) NOT NULL    AUTO_INCREMENT,
    days    int(3)  NOT NULL,
    tariff	int(2)	NOT NULL,
    order_id	int(11)	NOT NULL,
    vehicle_id	int(11)	NOT NULL,
    CONSTRAINT items_pk
	PRIMARY KEY (id),
    CONSTRAINT order_fk
	FOREIGN KEY (order_id)
	REFERENCES orders (id),
    CONSTRAINT item_vehicle_fk
	FOREIGN KEY (vehicle_id)
	REFERENCES vehicles (id) 
)  ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;
-- --------------------------------------------------------

