"use client";
import styles from "./Modal.module.css";

interface ModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export default function Modal({ title, message, onClose }: ModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose} className={styles.button}>Entendido</button>
      </div>
    </div>
  );
}
