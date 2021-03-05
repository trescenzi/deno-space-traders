import {
  // Checkbox,
  Confirm,
  Input,
  Number,
  Select,
  prompt,
} from "https://deno.land/x/cliffy/prompt/mod.ts";
import { Table } from "https://deno.land/x/cliffy/table/mod.ts";
import { text } from "https://x.nest.land/deno-figlet@0.0.5/mod.js";
import { isOnline } from "./src/status.ts";
import {
  getUser,
  createUser,
  NewUser,
  User,
  SpaceTraderUser,
  GoodType,
  FlightPlan,
} from "./src/user.ts";
import { searchInSystem, searchSystems, marketplace } from "./src/location.ts";
import { listLoans, LoanType } from "./src/loan.ts";
import { listShips, ShipClass, Ship } from "./src/ships.ts";

const awesomeText = (str: string) => text(str, "starwars");

async function startup(): Promise<User> {
  const existingUser: boolean = await Confirm.prompt(
    "Do you already have an account?"
  );
  if (existingUser) {
    const { user, token } = await prompt([
      {
        name: "user",
        message: "What's your user name",
        type: Input,
      },
      {
        name: "token",
        message: "What's your token",
        type: Input,
      },
    ]);
    return new User(token, user);
  }
  const user: string = await Input.prompt("Enter a username");
  const newUser: NewUser = await createUser(user);
  return new User(newUser.token, newUser.user.username);
}

async function help() {
  console.log("The following commands are available");
  console.log("Find Loans — lists loans that are available to take out");
  console.log("Take Out <loan type> — take out a type of loan");
  console.log("User — display user information");
  console.log("find ships <ship class> — display available ship information");
  console.log("buy ship — enter ship buying ui");
  console.log("buy good — enter good buying ui");
  console.log("sell good — enter good selling ui");
  console.log("search in system — find destinations near by");
  console.log("search systems — find destinations near by");
  console.log("marketplace — look at the marketplace of a specific location");
  console.log("exit — exit the game");
}

function displayShips(ships: Ship[]): void {
  ships.forEach(({ purchaseLocations, ...rest }) => {
    console.log(rest);
    console.log(purchaseLocations);
  });
}

function enumToSelectPromptOptions(
  values: string[]
): { name: string; value: string }[] {
  return values.map((k) => ({ name: k.toLowerCase(), value: k }));
}

async function promptBuyShip(user: User): Promise<SpaceTraderUser> {
  console.log("For reference ships available:");
  const shipClasses = Object.values(ShipClass);
  for (const shipClass of shipClasses) {
    displayShips(await listShips(shipClass as ShipClass, user.token));
  }
  const shipType = (
    await Input.prompt("What type of ship would you like to buy?")
  ).toUpperCase();
  const location = (
    await Input.prompt("Where would you like to buy it?")
  ).toUpperCase();
  return user.buyShip(shipType, location);
}

async function promptBuyGood(user: User): Promise<SpaceTraderUser> {
  console.log("For reference your user is");
  console.log(await user.toString());
  const shipId: string = await Input.prompt(
    `Please enter the ship id you'd like to load`
  );
  const good: string = await Select.prompt({
    message: "What would you like to buy?",
    options: enumToSelectPromptOptions(Object.values(GoodType)),
  });
  const quantity: number = await Number.prompt(
    "How much would you like to buy?"
  );
  return user.purchase(shipId, good as GoodType, quantity);
}

async function promptSellGood(user: User): Promise<number> {
  console.log("For reference your user is");
  user.update();
  console.log(await user.toString());
  const shipId: string = await Input.prompt(
    `Please enter the ship id you'd like to sell from`
  );
  const good: string = await Select.prompt({
    message: "What would you like to sell?",
    options: enumToSelectPromptOptions(Object.values(GoodType)),
  });
  const quantity: number = await Number.prompt(
    "How much would you like to sell?"
  );
  return user.sell(shipId, good as GoodType, quantity);
}

async function localSystemTable(user: User): Promise<void> {
  const system = await Input.prompt('Which system would you like to search?');
  const locations = await searchInSystem("OE", user.token);
  const locationTable = locations.map(({name, symbol, type}) => [symbol, name, type]);
  let table: Table = new Table()
    .header(["ID", "Type", "Name"])
    .body(locationTable)
    .padding(1)
    .border(true)
    .render();
}

async function systemTable(user: User): Promise<void> {
  const systems = await searchSystems(user.token);
  const systemTable: string[][] = systems.reduce<string[][]>(
    (systemTable, { symbol, name, locations }) => systemTable.concat(
      locations.map(({ name: lName, symbol: lSymbol, type }) => [
        symbol,
        name,
        lSymbol,
        type,
        lName,
      ]),
    ),
    []
  );
  let table: Table = new Table()
    .header(["System ID", "System Name", "ID", "Type", "Name"])
    .body(systemTable)
    .padding(1)
    .border(true)
    .render();
}

async function flightPlan(user: User): Promise<FlightPlan> {
  await systemTable(user);
  console.log("For reference your user is");
  console.log(await user.toString());
  const shipId: string = await Input.prompt(
    "Which ship would you like to create a flight plan for?"
  );
  const destination: string = await Input.prompt("Id of your destination");
  return user.createFlightPlan(shipId, destination);
}

async function gameLoop(user: User): Promise<string> {
  // TODO use Moo to lex the input
  const input = (
    await Input.prompt("What would you like to do(help)?")
  ).toLowerCase();
  switch (input) {
    case "help":
    case "h":
      await help();
      return input;
    case "user":
    case "user info":
    case "u":
      user.update();
      console.log(await user.toString());
      return input;
    case "find loans":
      console.log(await listLoans(user.token));
      return input;
    case "buy ship":
      console.log(await promptBuyShip(user));
      return input;
    case "buy good":
    case "buy fuel":
      console.log(await promptBuyGood(user));
      return input;
    case "search in system":
      await localSystemTable(user);
      return input;
    case "search systems":
      await systemTable(user);
      return input;
    case "create flight plan":
      console.log(await flightPlan(user));
      return input;
    case "marketplace":
      const location = await Input.prompt('Which location\'s marketplace?');
      console.log(await marketplace(location, user.token));
      return input;
    case "sell":
    case "sell good":
      console.log(await promptSellGood(user));
      return input;
  }
  if (input.startsWith("take out ")) {
    const type = input.slice(9).toUpperCase();
    if (type !== "STARTUP" && type !== "ENTERPRISE") {
      console.log("Loan type must be standard or enterprise");
    }
    try {
      await user.takeoutLoan(type as LoanType);
      console.log(`Success! You took out a new ${type} loan`);
    } catch (e) {
      console.log(JSON.stringify(e));
      console.log("Uhoh something went wrong taking out your loan");
    }
  }

  if (input.startsWith("find ships ")) {
    const type = input.slice(11).toUpperCase();
    if (type !== "MK-I") {
      console.log("Ship type must be MK-I");
    } else {
      const ships = await listShips(type as ShipClass, user.token);
      displayShips(ships);
    }
  }
  return input;
}

async function main() {
  console.log(await awesomeText(`Welcome to`));
  console.log(await awesomeText(`Space Traders`));
  if (await isOnline()) {
    const user = await startup();
    console.log(await awesomeText("Blasting off!"));
    let lastInput = "";
    while (lastInput.toLowerCase() !== "exit") {
      lastInput = await gameLoop(user);
    }
    console.log(await awesomeText("till next time"));
  } else {
    console.log("Server is down");
  }
}

main();
