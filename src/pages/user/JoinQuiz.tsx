import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function JoinQuiz() {
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && name.trim()) {
      // Store name in sessionStorage so we can use it in the play screen
      sessionStorage.setItem("playerName", name.trim());
      navigate(`/play/${roomCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 border border-gray-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">
            QuizMaster <span className="text-blue-500">Live</span>
          </h1>
          <p className="text-gray-500 text-sm">Enter a room code to join the fun!</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="roomCode" className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Room Code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="e.g. 123456"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-center text-lg tracking-widest bg-white text-gray-900"
              required
              maxLength={6}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. QuizHero"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
              required
              maxLength={20}
            />
          </div>

          <button
            type="submit"
            disabled={!roomCode.trim() || !name.trim()}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            JOIN GAME
          </button>
        </form>
      </motion.div>
    </div>
  );
}
