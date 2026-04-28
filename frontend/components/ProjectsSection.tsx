"use client";

import { useState } from "react";
import Image from "next/image";
import { projects } from "@/app/data/projects";
import { X, Play } from "lucide-react";

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

  const closeModal = () => setSelectedProject(null);
  return (
    <section className="relative bg-black py-32 px-6 md:px-12 overflow-hidden border-t border-[#1A1A1A]">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#F5A623] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#F5A623] blur-[150px] rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col items-center mb-24 text-center">
          <span className="text-[#F5A623] font-mono text-[10px] md:text-xs tracking-[0.4em] uppercase mb-6 opacity-80">
            Portfolio
          </span>
          <h2 className="text-4xl md:text-6xl text-[#D1D0C5] font-medium tracking-tighter leading-tight max-w-none">
            Recent Vehicle Projects
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {projects.map((project, index) => (
            <div
              key={index}
              onClick={() => setSelectedProject(project)}
              className="group relative overflow-hidden rounded-sm border border-[#1A1A1A] hover:border-[#F5A623]/30 transition-all duration-700 bg-[#0B0B0B] cursor-pointer"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  sizes="(max-w: 768px) 100vw, (max-w: 1200px) 50vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                {/* Hover Click Indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="bg-[#F5A623] text-black text-bold text-[10px] font-mono font-bold tracking-[0.3em] px-6 py-3 rounded-sm shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    CLICK TO VIEW
                  </div>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-8 md:p-10">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl md:text-3xl font-medium text-[#D1D0C5] tracking-tight group-hover:text-[#F5A623] transition-colors duration-500">
                    {project.title}
                  </h3>
                  <span className="text-[#F5A623] text-xs font-mono tracking-widest mt-2">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                
                <p className="text-[#A1A1A1] font-mono text-xs md:text-sm leading-relaxed max-w-xl tracking-wide opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  {project.description}
                </p>

                <div className="mt-8 flex items-center gap-4">
                    <div className="h-[1px] w-12 bg-[#F5A623]/30 group-hover:w-20 transition-all duration-700" />
                    <span className="text-[#F5A623] font-mono text-[10px] tracking-[0.2em] uppercase">View Project Gallery</span>
                </div>
              </div>

              {/* Hover Overlay Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#F5A623]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              {/* Animated Corner Accents */}
              <div className="absolute top-0 right-0 w-0 h-0 border-t border-r border-[#F5A623] opacity-0 group-hover:w-6 group-hover:h-6 group-hover:opacity-40 transition-all duration-500 ease-in-out" />
              <div className="absolute bottom-0 left-0 w-0 h-0 border-b border-l border-[#F5A623] opacity-0 group-hover:w-6 group-hover:h-6 group-hover:opacity-40 transition-all duration-500 ease-in-out" />
            </div>
          ))}
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity duration-500"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-[#0B0B0B] border border-[#1A1A1A] rounded-sm overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between p-6 md:p-8 bg-[#0B0B0B]/80 backdrop-blur-md border-b border-[#1A1A1A]">
              <div>
                <h3 className="text-2xl md:text-4xl font-medium text-[#D1D0C5] tracking-tight">
                  {selectedProject.title}
                </h3>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-[#1A1A1A] rounded-full transition-colors text-[#A1A1A1] hover:text-[#F5A623]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 md:p-10 space-y-12 custom-scrollbar">
              {/* Description Section */}
              <div className="max-w-3xl">
                <span className="text-[#F5A623] font-mono text-[10px] tracking-[0.3em] uppercase mb-4 block">About the Build</span>
                <p className="text-[#A1A1A1] font-mono text-sm md:text-base leading-relaxed tracking-wide">
                  {selectedProject.description}
                </p>
              </div>

              {/* Media Gallery Section */}
              <div className="space-y-8">
                <span className="text-[#F5A623] font-mono text-[10px] tracking-[0.3em] uppercase block">Project Media</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedProject.media.map((item, idx) => (
                    <div key={idx} className="group relative aspect-video bg-black rounded-sm overflow-hidden border border-[#1A1A1A]">
                      {item.type === "image" ? (
                        <Image
                          src={item.url}
                          alt={`${selectedProject.title} gallery ${idx}`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-w: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <video 
                            src={item.url} 
                            controls 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Media Item Label */}
                      <div className="absolute bottom-4 left-4 z-10">
                        <span className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 text-[9px] font-mono uppercase tracking-widest text-white/70">
                          {item.type} {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
