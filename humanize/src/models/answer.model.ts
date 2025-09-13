import { ObjectId } from "mongodb";
import { connectDB } from "../db";
// import console from "../utils/console";

export default interface Answer {
  question: string;
  answer: string;
  score: number;
  _id?: ObjectId; // Optional MongoDB document _id
}

// Create a new answer
export const createAnswer = async (answer: Answer) => {
  const db = await connectDB(); // Reuse the connection
  if (!db) {
    console.warn("Database not available. Answer not saved.");
    return { insertedId: null, acknowledged: false };
  }
  const answersCollection = db.collection("answers");
  const result = await answersCollection.insertOne(answer);
  console.log("Answer Created:", result);
  return result;
};

// Get answer by questionId
export const getAnswerByQuestion = async (question: string) => {
  const db = await connectDB(); // Reuse the connection
  if (!db) {
    console.warn("Database not available. Cannot retrieve answer.");
    return null;
  }
  const answersCollection = db.collection("answers");
  const answer = await answersCollection.findOne({ question });
  return answer;
};

// Update answer by questionId
export const updateAnswer = async (
  question: string,
  updatedAnswer: string,
  updatedScore: number
) => {
  const db = await connectDB(); // Reuse the connection
  if (!db) {
    console.warn("Database not available. Cannot update answer.");
    return "Database not available";
  }
  const answersCollection = db.collection("answers");
  const result = await answersCollection.updateOne(
    { question },
    { $set: { answer: updatedAnswer, score: updatedScore } }
  );
  return result.modifiedCount > 0
    ? "Answer updated successfully"
    : "Answer not found";
};

// Delete answer by questionId
export const deleteAnswer = async (question: string) => {
  const db = await connectDB(); // Reuse the connection
  if (!db) {
    console.warn("Database not available. Cannot delete answer.");
    return "Database not available";
  }
  const answersCollection = db.collection("answers");
  const result = await answersCollection.deleteOne({ question });
  return result.deletedCount > 0
    ? "Answer deleted successfully"
    : "Answer not found";
};
