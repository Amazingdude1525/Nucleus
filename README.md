#  NUCLEUS 

> **A Next-Generation Web-Based Computational Chemistry Ecosystem.**
> 
> [**View Live Demo**](https://nucleus-x.vercel.app/)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

##  About The Project

Traditional chemical education and computational chemistry research often rely on static, 2D representations of complex, 3D phenomena. This limits our intuitive understanding of quantum mechanics, molecular geometry, and thermodynamics. 

**NUCLEUS** was built to bridge the gap between theoretical physics and interactive experimentation. By shifting heavy computational rendering to the browser via WebGL and integrating spatial computing, NUCLEUS delivers an immersive, high-fidelity chemistry lab directly to your screen and no proprietary desktop software or VR headsets required.

##  Core Features

* **The Atomic Viewer:** A fully interactive 118-element periodic table. Select an element to fetch real-world macroscopic images (via Wikipedia API), or dive into the quantum realm with interactive 3D Bohr models and Heisenberg Uncertainty Principle visualizers.
* **Spatial Virtual Laboratory:** A 3D interactive workbench featuring **MediaPipe Hand Tracking**. Users can literally raise their hand to the webcam, pinch to grab 3D chemical bottles, and pour them into the beaker. The underlying thermodynamic engine calculates real-time enthalpy ($\Delta H$) and molarity state changes.
* **Molecule Explorer:** Integrated with the **PubChem PUG REST API**. Search for any compound to fetch live SDF data and render manipulatable 3D ball-and-stick or space-filling models using `3Dmol.js`.
* **AI Lab Mentor:** An integrated, context-aware chatbot powered by **Gemini 2.0 Flash**. It provides real-time thermodynamic explanations, balances complex equations (with full Markdown support), and offers lab safety guidance based on what you are currently mixing in the virtual lab.
* **Crystal Lattice Engine:** A dedicated Three.js visualizer for solid-state chemistry, rendering unit cells (SC, BCC, FCC) to demonstrate atomic packing efficiency.

##  System Architecture & Tech Stack

NUCLEUS is engineered for performance, utilizing a modern frontend stack to handle heavy 3D math and state management seamlessly.

* **Frontend:** React.js, Vite
* **Styling & Animation:** Tailwind CSS, Framer Motion (Glassmorphism UI)
* **3D Graphics & Rendering:** Three.js, WebGL, 3Dmol.js
* **Spatial Computing:** Google MediaPipe Hands
* **Data & Intelligence Layer:** * OpenRouter API (Gemini NLP Backend)
  * PubChem API (Molecular Data)
  * Wikipedia REST API (Macroscopic Imagery)

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn

