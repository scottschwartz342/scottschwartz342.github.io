var display=0;
var setup= false;
var needDig= true;
var canDec=true;
var  reset=false;

window.addEventListener("keydown", keyin)

function keyin(event)
{
     
     switch(event.key)
     {
          case "0":
               zero();
               break ; 
          case '.':
               dec();
               break ; 
          case '=':
               equ();
               break ;
          case 'Enter':
               equ();
               break ;
          case '+':
               add(); 
               break ; 
          case '1':
               one();
               break;
          case '2':
               two();
               break;
          case '3':
               three();
               break;
          case '-':
               min();
               break;    
          case '4':
               four()
               break;
          case '5':
               five();
               break;
          case '6':
               six();
               break;
          case '*':
               mult();
               break;
          case '7':
               seven();
               break;
          case '8':
               eight()
               break;
          case '9':
               nine();
               break;
          case '/': 
               div();
               break;
          case "Enter":
               equ();
               break;
     }
}

function zero()
{
     if(reset)
     {
          res()
     }
     if(!setup)
     {
          display= "0";
          setup=true;
     }
     else
     display+= "0";
     document.getElementById("display").innerHTML= display;
     needDig=false;
}

function one()
{
     if(reset)
     {
          res()
     }
     if(!setup)
     {
          display= "1";
          setup=true;
     }
     else
     display+= "1";
     document.getElementById("display").innerHTML= display;
     needDig=false;
}

function two()
{
     if(reset)
     {
          res()
     }
     if(!setup)
     {
          display= "2";
          setup=true;
     }
     else
     display+= "2";
     document.getElementById("display").innerHTML= display;
     needDig=false;
     
}

function three()
{
     if(reset)
     {
          res()
     }
     if(!setup)
     {
          display= "3";
          setup=true;
     }
     else
     display+= "3";
     document.getElementById("display").innerHTML= display;
     needDig=false;
     
}

function four()
{
     if(reset)
     {
          res()
     }
     if(!setup)
     {
          display= "4";
          setup=true;
     }
     else
     display+= "4";
     document.getElementById("display").innerHTML= display;
     needDig=false;
     
}

function five()
{
     if(reset)
     {
          res()
     }
     if(!setup)
     {
          display= "5";
          setup=true;
     }
     else
     display+= "5";
     document.getElementById("display").innerHTML= display;
     needDig=false;
     
}

function six()
{
     if(reset)
     {
          res()
     }
     if(!setup)
     {
          display= "6";
          setup=true;
     }
     else
     display+= "6";
     document.getElementById("display").innerHTML= display;
     needDig=false;
     
}

function seven()
{
     if(reset)
     {
          res()
     }
     if(!setup)
     {
          display= "7";
          setup=true;
     }
     else
     display+= "7";
     document.getElementById("display").innerHTML= display;
     needDig=false;

}

function eight()
{
     if(reset)
     {
          res()
     }
     if(!setup)
     {
          display= "8";
          setup=true;
     }
     else
     display+= "8";
     document.getElementById("display").innerHTML= display;
     needDig=false;
     
}

function nine()
{
     if(reset)
     {
          res()
     }
     if(!setup)
     {
          display= "9";
          setup=true;
     }
     else
     display+= "9";
     document.getElementById("display").innerHTML= display;
     needDig=false;
     
}

function dec()
{
     if(needDig)
          return ;
     if(!setup)
     {
          display= "0.";
          setup=true;
     }
     else
     display+= ".";
     document.getElementById("display").innerHTML= display;
     needDig=true;
}

function add()
{
     if(needDig)
          return ;

     display+= "+";
     document.getElementById("display").innerHTML= display;
     needDig=true;
     reset=false;
     setup=true;
}

function min()
{
     if(needDig)
          return ;

     display+= "-";
     document.getElementById("display").innerHTML= display;
     needDig=true;
     reset=false;
     setup=true;
}

function mult()
{
     if(needDig)
          return ;

     display+= "*";
     document.getElementById("display").innerHTML= display;
     needDig=true;
     reset=false;
     setup=true;
}

function div()
{
     if(needDig)
          return ;

     display+= "/";
     document.getElementById("display").innerHTML= display;
     needDig=true;
     reset=false;
     setup=true;
}

function equ()
{
     if(needDig)
     return ;
     let str= display;
     let array=[];
     let num="";
     let curr;
     let numSpec= 0;
     
     for(let i=0; i<str.length; i++)
     {
          curr=str.charAt(i);
          if(curr=='+' || curr=='-' || curr == '/' || curr == '*')
          {
               array.push(num);
               array.push(curr);
               num="";
               numSpec++;
          }
          else
          num+=curr;
     }
     array.push(num);
     
     console.log(array);
     console.log(numSpec);
     
     if(numSpec==1)
     {
          display= single(array);
     }
     else
          display= double(array)
     
     document.getElementById("display").innerHTML= display;
     // reset=true;
     setup=false;
}

function single(array)
{
     let ans=0;
     let a= Number(array[0]);
     let b= Number(array[2]);
     let opp= array[1];
     
     if(opp=='+')
     return a + b;
     else if(opp=='-')
     return a - b;
     else if(opp=='*')
     return a * b;
     else if(opp=='/')
     return a / b;
     else
     return "error"; 
}

function double(array)
{
     let ans=0;

     for(let i =0; i<array.length; i++)
     {
          if(array[i]=='*' || array[i]=='/')
          {
               let tempArr= [array[i-1], array[i], array[i+1]];
               array[i+1]= single(tempArr);
               array[i-1]= '!';
               array[i]="!"
               console.log("array",...array);
          }
     }
     array= clean(array);
     
     for(let i =0; i<array.length; i++)
     {
          if(array[i]=='+' || array[i]=='-')
          {
               let tempArr= [array[i-1], array[i], array[i+1]];
               array[i+1]= single(tempArr);
               array[i-1]= '!';
               array[i]="!"
               console.log("array",...array);
          }
     }
     array= clean(array);

     console.log("array",...array);
     return array[0];
}

function clean(arr)
{
     let newArr=[];
     for(let i=0; i<arr.length; i++)
     {
          if(!(arr[i]=='!'))
          {
               newArr.push(arr[i]);
          }
     }

     return newArr;
}

function res()
{
     display=0;
     setup= false;
     needDig= true;
     canDec=true;
     reset=true;
     console.log("in it");
}
