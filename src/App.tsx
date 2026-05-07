import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Teacher from "./pages/Teacher";
import Student from "./pages/Student";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentLessons from "./pages/StudentLessons";
import NotFound from "./pages/NotFound";
import LessonDetails from "./pages/LessonDetails";
import StudentStories from "./pages/StudentStories";
import StoryDetail from "./pages/StoryDetail";
import GamePage from "./pages/GamesPage";
import FlashcardsGame from "./pages/FlashcardsGame";
import PuzzleGame from "./pages/PuzzleGame";
import ForgotPassword from "./pages/ForgotPassword";
import MemoryGame from "./pages/MemoryGame";
import WordRaceGame from "./pages/WordRaceGame";
import ListeningGame from "./pages/ListeningGame";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/student" element={<Student />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/student-dashboard/lessons" element={<StudentLessons />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher-dashboard/*" element={<TeacherDashboard />} />
          <Route path="/student-dashboard/lessons/:id" element={<LessonDetails />} />
          <Route path="/student-dashboard/stories" element={<StudentStories />} />
          <Route path="/student-dashboard/stories/:id" element={<StoryDetail />} />
          <Route path="/student-dashboard/games" element={<GamePage />} />
          <Route path="/student-dashboard/games/puzzle" element={<PuzzleGame />} />
        <Route path="/student-dashboard/games/flashcards" element={<FlashcardsGame />} />
        <Route path="/student-dashboard/games/memory" element={<MemoryGame />} />
        <Route path="/student-dashboard/games/word-race" element={<WordRaceGame />} />
        <Route path="/student-dashboard/games/listening" element={<ListeningGame />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
