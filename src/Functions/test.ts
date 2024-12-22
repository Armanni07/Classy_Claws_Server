/*const RetrieveQuery: string = `
SELECT 
    p.id,
    p.Name,
    p.Description,
    JSON_OBJECT(
        'Designation', Creator.Designation,
        'Email', Creator.Email
    ) AS Creator,
    JSON_OBJECT(
        'Designation', Updater.Designation,
        'Email', Updater.Email
    ) AS Updater,
    JSON_OBJECT(
        'Name', c.Name,
        'Description', c.Description
    ) AS category
FROM Products AS p
JOIN Staff AS Creator 
ON (p.Created_By = Creator.id) 
JOIN Staff AS Updater 
ON (p.Updated_By = Update.id) 
JOIN Categories AS c 
ON (p.Category_Id = c.id) 
WHERE p.id = ?;
`;
*/

// const RetrieveQuery: string = `
// SELECT Users.* ,
// JSON_ARRAYAGG(
//     JSON_OBJECT(
//         'Name': p.Name,
//         'Description': p.Description,
//         'Quantity': s.Quantity
//         )
//         ) as Product
// From Users
// JOIN Sales as s on (Users.id = s.Bought_By)
// JOIN Products as p on (p.id = s.Product_Id)
// WHERE Users.id = ?
// `;

const RetrieveQuery: string = `
  SELECT 
    MONTH(Date_Created) AS Month,
    SUM(SalePrice * Quantity) AS Total_Sales
  FROM 
    Sales
  GROUP BY 
    MONTH(Date_Created);
 `;

//  export const CreateMail = (req: Request, res: Response) => {
//    const token = req.cookies.accessToken;

//    const CreateQuery: string = `
//      INSERT INTO Mail (Messages, User_ID, Date)
//      VALUES (?,?,?)`;
//  };

//  export const RetrieveMail = (req: Request, res: Response) => {};

