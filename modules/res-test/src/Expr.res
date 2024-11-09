// 定义运算符类型
type operator = Add | Subtract | Multiply | Divide | Square | Cube

// 生成指定范围内的随机整数
let getRandomInt = (min: int, max: int): int => {
  min + Js.Math.floor(Js.Math.random() *. Belt.Float.fromInt(max - min + 1))
}

// 获取随机运算符
let getRandomOperator = (): operator => {
  switch getRandomInt(1, 6) {
  | 1 => Add
  | 2 => Subtract
  | 3 => Multiply
  | 4 => Divide
  | 5 => Square
  | _ => Cube
  }
}

// 运算符转字符串
let operatorToString = (op: operator): string => {
  switch op {
  | Add => "+"
  | Subtract => "-"
  | Multiply => "*"
  | Divide => "/"
  | Square => "^2"
  | Cube => "^3"
  }
}

// 递归生成表达式
let rec generateExpression = (steps: int, minNum: int, maxNum: int): string => {
  if steps <= 0 {
    getRandomInt(minNum, maxNum)->Belt.Int.toString
  } else {
    let op = getRandomOperator()
    switch op {
    | Square | Cube => {
        let base = generateExpression(steps - 1, minNum, maxNum)
        `(${base})${operatorToString(op)}`
      }
    | _ => {
        let left = generateExpression(steps - 1, minNum, maxNum)
        let right = generateExpression(steps - 1, minNum, maxNum)
        `(${left} ${operatorToString(op)} ${right})`
      }
    }
  }
}

// 使用 mathjs 计算表达式
@module("mathjs") external calc: string => float = "evaluate"
external toInt: float => int = "%identity"

// 主函数：生成表达式并计算结果
let generateAndCalculate = (steps: int, minNum: int, maxNum: int) => {
  let expr = generateExpression(steps, minNum, maxNum)
  let result = calc(expr)->Math.floor->toInt
  (expr, result)
}

// 示例使用
// let (expr, result) = generateAndCalculate(3, 1, 10)
// Js.log2("Expression:", expr)
// Js.log2("Result:", result)
