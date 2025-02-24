// import chalk from "chalk";

// const log = (...message: unknown[]) => {
//   console.log(
//     "🔍",
//     chalk.greenBright(
//       message
//         .map((item) => {
//           if (typeof item === "string") {
//             return item;
//           }
//           return JSON.stringify(item);
//         })
//         .join(" ")
//     )
//   );
// };

// const error = (...message: unknown[]) => {
//   console.log(
//     "❌",
//     chalk.redBright(
//       message
//         .map((item) => {
//           if (typeof item === "string") {
//             return item;
//           }
//           return JSON.stringify(item);
//         })
//         .join(" ")
//     )
//   );
// };

// const warn = (...message: unknown[]) => {
//   console.log(
//     "⚠️",
//     chalk.yellowBright(
//       message
//         .map((item) => {
//           if (typeof item === "string") {
//             return item;
//           }
//           return JSON.stringify(item);
//         })
//         .join(" ")
//     )
//   );
// };

// const info = (...message: unknown[]) => {
//   console.log(
//     "✔",
//     chalk.cyanBright(
//       message
//         .map((item) => {
//           if (typeof item === "string") {
//             return item;
//           }
//           return JSON.stringify(item);
//         })
//         .join(" ")
//     )
//   );
// };

// const debug = (...message: unknown[]) => {
//   console.log(
//     "🐜",
//     chalk.gray(
//       message
//         .map((item) => {
//           if (typeof item === "string") {
//             return item;
//           }
//           return JSON.stringify(item);
//         })
//         .join(" ")
//     )
//   );
// };

// export default { log, error, warn, info, debug };
