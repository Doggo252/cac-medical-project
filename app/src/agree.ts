// What the app should do after both readers have answered.
export type Decision = {
  status: 'agree' | 'ask' | 'confirm' | 'not_handled'
  letterType: string | null   // the type to go with, if any
  choices: string[]           // for 'ask': the two types to pick from
}

// readerA is null when there was no internet.
export function decide(readerA: string | null, readerB: string): Decision {
  // case 4, then 3, then 1, then 2
  if (readerA === "OTHER" && readerB === "OTHER"){
    return { status: 'not_handled', letterType: null, choices: [] }
  }

  else if (readerA === null){
    return { status: 'confirm', letterType: readerB, choices: [] }
  }

  else if (readerA === readerB){
    return { status: 'agree', letterType: readerB, choices: [] }
  }
  else{
    return { status: 'ask', letterType: null, choices: [readerA, readerB] }
  }
  
}