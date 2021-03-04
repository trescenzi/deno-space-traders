import {
// Checkbox,
  Confirm,
  Input,
//  Number,
  prompt,
} from "https://deno.land/x/cliffy/prompt/mod.ts";
import {text } from 'https://x.nest.land/deno-figlet@0.0.5/mod.js'
import {isOnline} from './src/status.ts';
import {getUser, takeoutLoan, createUser, NewUser} from './src/user.ts';
import {listLoans, LoanType} from './src/loan.ts';

const awesomeText = (str: string) => text(str, 'starwars');

async function startup(): Promise<{user: string, token: string}> {
  const existingUser: boolean = await Confirm.prompt('Do you already have an account?');
  if (existingUser) {
    return prompt([{
        name: "user",
        message: "What's your user name",
        type: Input,
    }, {
        name: "token",
        message: "What's your token",
        type: Input,
    }]);
  }
  const user : string = await Input.prompt('Enter a username');
  const newUser : NewUser = await createUser(user);
  return {
    token: newUser.token,
    user: newUser.user.username,
  };
}

async function help() {
  console.log('The following commands are available');
  console.log('Find Loans — lists loans that are available to take out');
  console.log('Take Out <loan type> — take out a type of loan');
  console.log('User — display user information');
}

async function gameLoop(user: string, token: string) : Promise<string> {
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
      console.log(await getUser(user, token));
      return input;
    case 'find loans':
      console.log(await listLoans(token));
      return input;
  }
  if (input.startsWith('take out ')) {
    const type = input.slice(9).toUpperCase();;
    if (type !== 'STARTUP' && type !== 'ENTERPRISE') {
      console.log('Loan type must be standard or enterprise');
    }
    try {
      await takeoutLoan(user, token, type as LoanType);
      console.log(`Success! You took out a new ${type} loan`);
    } catch (e) {
      console.log('Uhoh something went wrong taking out your loan');
    }
  }
  return input;
}

async function main() {
  console.log(await awesomeText(`Welcome to`))
  console.log(await awesomeText(`Space Traders`))
  if (await isOnline()) {
    const {
      user,
      token
    } = await startup();
    console.log(await awesomeText('Blasting off!'));
    let lastInput = '';
    while(lastInput.toLowerCase() !== 'exit') {
      lastInput = await gameLoop(user, token);
    }
    console.log(await awesomeText('till next time'));
  } else {
    console.log('Server is down');
  }
}

main();
