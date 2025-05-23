"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Group {
  id: string;
  name: string;
  members: string[];
}

interface SorteoResult {
  group1: string;
  group2: string;
  member1: string;
  member2: string;
}

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [selectedGroupForMember, setSelectedGroupForMember] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [sorteoResult, setSorteoResult] = useState<SorteoResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Agregar un nuevo grupo
  const addGroup = () => {
    if (newGroupName.trim() === "") return;
    
    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      members: []
    };
    
    setGroups([...groups, newGroup]);
    setNewGroupName("");
  };

  // Agregar un miembro a un grupo
  const addMember = () => {
    if (newMemberName.trim() === "" || !selectedGroupForMember) return;
    
    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroupForMember) {
        return {
          ...group,
          members: [...group.members, newMemberName]
        };
      }
      return group;
    });
    
    setGroups(updatedGroups);
    setNewMemberName("");
  };

  // Eliminar un miembro de un grupo
  const removeMember = (groupId: string, memberIndex: number) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        const updatedMembers = [...group.members];
        updatedMembers.splice(memberIndex, 1);
        return { ...group, members: updatedMembers };
      }
      return group;
    });
    
    setGroups(updatedGroups);
  };

  // Eliminar un grupo
  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId));
    // Actualizar selección si es necesario
    setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    if (selectedGroupForMember === groupId) {
      setSelectedGroupForMember(null);
    }
  };

  // Manejar la selección de grupos para el sorteo
  const handleGroupSelection = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      if (selectedGroups.length < 2) {
        setSelectedGroups([...selectedGroups, groupId]);
      }
    }
  };

  // Función para verificar si un nombre coincide con "marcelo" o "marce"
  const isMarcelo = (name: string): boolean => {
    const normalizedName = name.toLowerCase().trim();
    return normalizedName.includes("marcelo") || normalizedName.includes("marce");
  };

  // Función para verificar si un nombre coincide con "mariana" o "marian"
  const isMariana = (name: string): boolean => {
    const normalizedName = name.toLowerCase().trim();
    return normalizedName.includes("mariana") || normalizedName.includes("marian");
  };

  // Función para encontrar un miembro específico en un grupo
  const findMemberInGroup = (group: Group, predicate: (name: string) => boolean): number => {
    return group.members.findIndex(predicate);
  };

  // Realizar el sorteo
  const realizarSorteo = () => {
    if (selectedGroups.length !== 2) return;
    
    const group1 = groups.find(g => g.id === selectedGroups[0]);
    const group2 = groups.find(g => g.id === selectedGroups[1]);
    
    if (!group1 || !group2 || group1.members.length === 0 || group2.members.length === 0) {
      alert("Ambos grupos deben tener al menos un miembro");
      return;
    }
    
    // Iniciar animación
    setIsAnimating(true);
    
    // Variables para almacenar los índices y nombres de los miembros seleccionados
    let randomMemberIndex1 = -1;
    let randomMemberIndex2 = -1;
    let randomMember1 = "";
    let randomMember2 = "";
    
    // Verificar si hay "marcelo" en alguno de los grupos
    const marceloIndex1 = findMemberInGroup(group1, isMarcelo);
    const marceloIndex2 = findMemberInGroup(group2, isMarcelo);
    
    if (marceloIndex1 !== -1) {
      // Si "marcelo" está en el grupo 1, buscar "mariana" en el grupo 2
      randomMemberIndex1 = marceloIndex1;
      randomMember1 = group1.members[randomMemberIndex1];
      
      const marianaIndex = findMemberInGroup(group2, isMariana);
      if (marianaIndex !== -1) {
        // Si "mariana" está en el grupo 2, seleccionarla
        randomMemberIndex2 = marianaIndex;
        randomMember2 = group2.members[randomMemberIndex2];
      } else {
        // Si no está "mariana", seleccionar aleatoriamente
        randomMemberIndex2 = Math.floor(Math.random() * group2.members.length);
        randomMember2 = group2.members[randomMemberIndex2];
      }
    } else if (marceloIndex2 !== -1) {
      // Si "marcelo" está en el grupo 2, buscar "mariana" en el grupo 1
      randomMemberIndex2 = marceloIndex2;
      randomMember2 = group2.members[randomMemberIndex2];
      
      const marianaIndex = findMemberInGroup(group1, isMariana);
      if (marianaIndex !== -1) {
        // Si "mariana" está en el grupo 1, seleccionarla
        randomMemberIndex1 = marianaIndex;
        randomMember1 = group1.members[randomMemberIndex1];
      } else {
        // Si no está "mariana", seleccionar aleatoriamente
        randomMemberIndex1 = Math.floor(Math.random() * group1.members.length);
        randomMember1 = group1.members[randomMemberIndex1];
      }
    } else {
      // Si no hay "marcelo" en ningún grupo, seleccionar aleatoriamente
      randomMemberIndex1 = Math.floor(Math.random() * group1.members.length);
      randomMemberIndex2 = Math.floor(Math.random() * group2.members.length);
      randomMember1 = group1.members[randomMemberIndex1];
      randomMember2 = group2.members[randomMemberIndex2];
    }
    
    // Guardar el resultado
    setSorteoResult({
      group1: group1.name,
      group2: group2.name,
      member1: randomMember1,
      member2: randomMember2
    });
    
    // Remover los miembros sorteados después de la animación
    setTimeout(() => {
      const updatedGroups = groups.map(group => {
        if (group.id === selectedGroups[0]) {
          const updatedMembers = [...group.members];
          updatedMembers.splice(randomMemberIndex1, 1);
          return { ...group, members: updatedMembers };
        }
        if (group.id === selectedGroups[1]) {
          const updatedMembers = [...group.members];
          updatedMembers.splice(randomMemberIndex2, 1);
          return { ...group, members: updatedMembers };
        }
        return group;
      });
      
      setGroups(updatedGroups);
      setIsAnimating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto bg-white text-gray-800">
      <motion.h1 
        className="text-3xl font-bold mb-6 text-center text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Sorteaditos
      </motion.h1>
      
      {/* Agregar Grupos */}
      <motion.div 
        className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Agregar Grupo</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Nombre del grupo"
            className="flex-1 p-3 border rounded text-gray-800 bg-white text-base"
          />
          <motion.button 
            onClick={addGroup}
            className="bg-blue-500 text-white px-5 py-3 rounded-lg text-base font-medium hover:bg-blue-600 shadow-sm"
            whileTap={{ scale: 0.95 }}
          >
            Agregar
          </motion.button>
        </div>
      </motion.div>
      
      {/* Agregar Miembros */}
      <AnimatePresence>
        {groups.length > 0 && (
          <motion.div 
            className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100 shadow-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Agregar Miembro</h2>
            <div className="flex flex-col gap-3">
              <select
                value={selectedGroupForMember || ""}
                onChange={(e) => setSelectedGroupForMember(e.target.value)}
                className="w-full p-3 border rounded text-gray-800 bg-white text-base"
              >
                <option value="">Seleccionar grupo</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nombre del miembro"
                className="w-full p-3 border rounded text-gray-800 bg-white text-base"
              />
              <motion.button 
                onClick={addMember}
                className="bg-green-500 text-white px-5 py-3 rounded-lg text-base font-medium hover:bg-green-600 shadow-sm w-full"
                whileTap={{ scale: 0.95 }}
              >
                Agregar Miembro
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Lista de Grupos */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Grupos</h2>
        
        {groups.length === 0 ? (
          <p className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">No hay grupos creados aún</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {groups.map(group => (
                <motion.div 
                  key={group.id} 
                  className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-800">{group.name}</h3>
                    <motion.button 
                      onClick={() => removeGroup(group.id)}
                      className="text-red-500 hover:text-red-700 bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-sm"
                      whileTap={{ scale: 0.9 }}
                    >
                      ×
                    </motion.button>
                  </div>
                  
                  <div className="mb-3 flex items-center bg-white p-2 rounded-md">
                    <input
                      type="checkbox"
                      id={`select-${group.id}`}
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => handleGroupSelection(group.id)}
                      disabled={selectedGroups.length >= 2 && !selectedGroups.includes(group.id)}
                      className="mr-2 h-5 w-5"
                    />
                    <label htmlFor={`select-${group.id}`} className="text-gray-700 text-base">Seleccionar para sorteo</label>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md">
                    <h4 className="font-medium text-gray-700 mb-2">Miembros:</h4>
                    {group.members.length === 0 ? (
                      <p className="text-gray-500 text-center py-2">No hay miembros</p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        <AnimatePresence>
                          {group.members.map((member, index) => (
                            <motion.li 
                              key={index} 
                              className="flex justify-between items-center py-2"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2 }}
                              layout
                            >
                              <span className="text-gray-800">{member}</span>
                              <motion.button 
                                onClick={() => removeMember(group.id, index)}
                                className="text-red-500 hover:text-red-700 bg-gray-100 rounded-full h-7 w-7 flex items-center justify-center"
                                whileTap={{ scale: 0.9 }}
                              >
                                ×
                              </motion.button>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Botón de Sorteo */}
      <div className="mb-6 text-center">
        <motion.button 
          onClick={realizarSorteo}
          disabled={selectedGroups.length !== 2 || isAnimating}
          className={`px-6 py-4 rounded-lg text-white text-lg font-semibold w-full max-w-xs ${
            selectedGroups.length === 2 && !isAnimating 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-gray-400 cursor-not-allowed'
          } shadow-md`}
          whileTap={selectedGroups.length === 2 ? { scale: 0.95 } : {}}
        >
          {isAnimating ? "Sorteando..." : "Realizar Sorteo"}
        </motion.button>
        <p className="text-sm text-gray-500 mt-2">
          {selectedGroups.length === 0 
            ? "Selecciona dos grupos para realizar el sorteo" 
            : selectedGroups.length === 1 
              ? "Selecciona un grupo más" 
              : "¡Listo para sortear!"}
        </p>
      </div>
      
      {/* Resultados del Sorteo */}
      <AnimatePresence>
        {sorteoResult && (
          <motion.div 
            className="bg-green-100 border border-green-200 rounded-lg p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2 
              className="text-2xl font-bold mb-4 text-gray-800"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              ¡Resultado del Sorteo!
            </motion.h2>
            <motion.div 
              className="flex flex-col gap-4 items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="bg-white p-5 rounded-lg shadow-md w-full max-w-xs"
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <p className="font-semibold text-gray-600">{sorteoResult.group1}</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{sorteoResult.member1}</p>
              </motion.div>
              <motion.div 
                className="text-2xl font-bold text-gray-800"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, 0, -10, 0] }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                +
              </motion.div>
              <motion.div 
                className="bg-white p-5 rounded-lg shadow-md w-full max-w-xs"
                initial={{ x: 50 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <p className="font-semibold text-gray-600">{sorteoResult.group2}</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{sorteoResult.member2}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
