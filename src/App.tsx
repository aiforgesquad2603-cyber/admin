/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Quizzes } from "./pages/Quizzes";
import { LiveControl } from "./pages/LiveControl";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="live" element={<LiveControl />} />
          <Route path="*" element={<div className="p-8 text-center text-muted-foreground">Page under construction</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
