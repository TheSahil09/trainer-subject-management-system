import React from "react";
import { Link } from "react-router-dom";

export default function SubjectsPage() {
  return (
    <div className="page-content">
      <h2>Subjects (Deprecated)</h2>
      <p>
        The old "Subjects" area has been migrated to the new <b>Courses</b> and
        <b> Modules</b> concepts. Use the links below to manage courses and modules.
      </p>

      <ul>
        <li>
          Manage courses: <Link to="/admin/courses">Courses</Link>
        </li>
        <li>
          Manage modules: <Link to="/admin/modules">Modules</Link>
        </li>
      </ul>

      <p>If you need help migrating data from Subjects → Courses/Modules, contact the admin.</p>
    </div>
  );
}
