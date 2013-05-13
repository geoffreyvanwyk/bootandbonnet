INSERT INTO manufacturers (name)
	SELECT DISTINCT Make
		FROM temporary_models;
