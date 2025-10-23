import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useParams, Navigate } from "react-router-dom";
import MarkdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItMultimdTable from "markdown-it-multimd-table";
import markdownItContainer from "markdown-it-container";

export default function App() {
    const currentCourse = localStorage.getItem("현재 과정");
    
    return(
        <>
            <Routes>
                <Route
                    path="/"
                    element={
                        currentCourse
                        ? <Navigate to={`/${currentCourse}`} replace />
                        : <Navigate to="/first" replace />
                    }
                />
                <Route
                    path="/first"
                    element={
                        currentCourse
                        ? <Navigate to={`/${currentCourse}`} replace />
                        : <FirstCourse />
                    }
                />
                <Route
                    path="/add"
                    element={
                        currentCourse
                        ? <AddCourse />
                        : <Navigate to="/first" replace />
                    }
                />
                <Route
                    path="/switch"
                    element={
                        currentCourse
                        ? <SwitchCourse />
                        : <Navigate to="/first" replace />
                    }
                />
                <Route
                    path="/:courseCode"
                    element={
                        currentCourse
                        ? <CourseHome />
                        : <Navigate to="/first" replace />
                    }
                />
            </Routes>
        </>
    );
}