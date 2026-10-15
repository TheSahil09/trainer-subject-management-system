import React from "react";
import { Link } from "react-router-dom";

export default function SubjectsPage() {
	return (
		<div className="page-container subjects-page">
			<h1>Subjects Removed</h1>
			<p>
				This project no longer manages "subjects." All domain objects have been
				migrated to use <strong>courses</strong> and <strong>modules</strong>.
			</p>
			<p>
				Use the <Link to="/admin/courses">Courses</Link> and <Link to="/admin/modules">Modules</Link> pages
				to manage subjects' previous functionality.
			</p>
		</div>
	);
}
