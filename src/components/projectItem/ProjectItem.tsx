"use client";

import { useState } from "react";
import Link from "next/link";
import TaskItem from "@/components/taskItem/TaskItem";
import { Project } from "@/models/project";
import styles from "./ProjectItem.module.css";

type ProjectItemProps = {
  project: Project;
};

export default function ProjectItem({ project }: ProjectItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dataOpen = isOpen ? "open" : "closed";

  return (
    <section className={styles.wrapper}>
      <header className={styles.header} data-open={dataOpen}>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? `Collapse ${project.title}` : `Expand ${project.title}`}
          aria-expanded={isOpen}
        >
          <span className={styles.arrow} data-open={dataOpen}>
            ▶
          </span>
        </button>

        <Link href={`/project/${project.id}`} className={styles.projectLink}>
          {project.title}
        </Link>
      </header>

      {isOpen && (
        <div className={styles.taskList}>
          {project.tasks.map((task) => (
            <TaskItem key={task.id ?? task.title} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}
