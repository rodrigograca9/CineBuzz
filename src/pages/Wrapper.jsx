import React, { useEffect, useState } from 'react';
import supabase from '../helper/supabaseClient';
import { Navigate, useNavigate } from "react-router-dom";

function AdminWrapper({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Verificar se o utilizador está autenticado
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData?.session) {
          setLoading(false);
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Verificar se o utilizador é administrador
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("is_admin")
          .eq("uid", userId)
          .single();
        
        if (userError) {
          console.error("Erro ao verificar status de administrador:", userError);
          setLoading(false);
          return;
        }
        
        setIsAdmin(userData?.is_admin === true);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">A verificar permissões...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

export default AdminWrapper;