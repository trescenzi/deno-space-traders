import {
// Checkbox,
  Confirm,
  Input,
//  Number,
  prompt,
} from "https://deno.land/x/cliffy/prompt/mod.ts";
import {text } from 'https://x.nest.land/deno-figlet@0.0.5/mod.js'
import {isOnline} from './src/status.ts';
import {getUser, createUser, NewUser, User, SpaceTraderUser} from './src/user.ts';
import {listLoans, LoanType} from './src/loan.ts';
import {listShips, ShipClass, Ship} from './src/ships.ts';

const awesomeText = (str: string) => text(str, 'starwars');

async function startup(): Promise<User> {
  const existingUser: boolean = await Confirm.prompt('Do you already have an account?');
  if (existingUser) {
    const {
      user,
      token
    } = await prompt([{
        name: "user",
        message: "What's your user name",
        type: Input,
    }, {
        name: "token",
        message: "What's your token",
        type: Input,
    }]);
    return new User(token, user);
  }
  const user : string = await Input.prompt('Enter a username');
  const newUser : NewUser = await createUser(user);
  return new User(newUser.token, newUser.user.username);
}

async function help() {
  console.log('The following commands are available');
  console.log('Find Loans — lists loans that are available to take out');
  console.log('Take Out <loan type> — take out a type of loan');
  console.log('User — display user information');
  console.log('find ships <ship class> — display available ship information');
  console.log('exit — exit the game');
}

async function promptBuyShip(user: User) : Promise<SpaceTraderUser> {
  const shipType = (await Input.prompt('What type of ship would you like to buy?')).toUpperCase();
  const location = (await Input.prompt('Where would you like to buy it?')).toUpperCase();
  return user.buyShip(shipType, location);
}
async function gameLoop(user: User) : Promise<string> {
  // TODO use Moo to lex the input
  const input = (await Input.prompt('What would you like to do(help)?')).toLowerCase();
  switch(input) {
    case 'help':
    case 'h':
      await help();
      return input;
    case 'user':
    case 'user info':
    case 'u':
      console.log(await user.toString());
      return input;
    case 'find loans':
      console.log(await listLoans(user.token));
      return input;
    case 'buy ship':
      console.log(await promptBuyShip(user));
      return input;
  }
  if (input.startsWith('take out ')) {
    const type = input.slice(9).toUpperCase();;
    if (type !== 'STARTUP' && type !== 'ENTERPRISE') {
      console.log('Loan type must be standard or enterprise');
    }
    try {
      await user.takeoutLoan(type as LoanType);
      console.log(`Success! You took out a new ${type} loan`);
    } catch (e) {
      console.log(JSON.stringify(e));
      console.log('Uhoh something went wrong taking out your loan');
    }
  }

  if (input.startsWith('find ships ')) {
    const type = input.slice(11).toUpperCase();;
    if (type !== 'MK-I') {
      console.log('Ship type must be MK-I');
    } else {
      const ships = await listShips(type as ShipClass, user.token)
      ships.forEach(({
        purchaseLocations,
        ...rest
      }: Ship) => {
        console.log(rest);
        console.log(purchaseLocations);
      });
    }
  }
  return input;
}

async function main() {
  console.log(await awesomeText(`Welcome to`))
  console.log(await awesomeText(`Space Traders`))
  if (await isOnline()) {
    const user = await startup();
    console.log(await awesomeText('Blasting off!'));
    let lastInput = '';
    while(lastInput.toLowerCase() !== 'exit') {
      lastInput = await gameLoop(user);
    }
    console.log(await awesomeText('till next time'));
  } else {
    console.log('Server is down');
  }
}

main();
