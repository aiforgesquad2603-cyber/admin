/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Quizzes } from "./pages/Quizzes";
import { LiveControl } from "./pages/LiveControl";
import { JoinQuiz } from "./pages/user/JoinQuiz";
import { PlayQuiz } from "./pages/user/PlayQuiz";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="live" element={<LiveControl />} />
          <Route path="*" element={<div className="p-8 text-center text-muted-foreground">Page under construction</div>} />
        </Route>

        {/* User Portal Routes */}
        <Route path="/join" element={<JoinQuiz />} />
        <Route path="/play/:roomCode" element={<PlayQuiz />} />
      </Routes>
    </BrowserRouter>
  );
}
