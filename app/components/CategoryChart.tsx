import { ChartData } from '@/type'
import React, { useCallback, useEffect, useState } from 'react'
import { getCategoryProductCategoryDistribution } from '../actions';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, BarChart, LabelList, Cell } from 'recharts';
import EmptyState from './EmptyState';

const CategoryChart = ({ email }: { email: string }) => {

  const [data, setData] = useState<ChartData[]>([])

  const COLORS = {
    default: "#e9d4ff"
  }

  const fetchData = useCallback(async () => {
    try {
      if (email) {
        const data = await getCategoryProductCategoryDistribution(email);
        if (data) {
          setData(data);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [email]);

  useEffect(() => {
    if (email)
      fetchData();
  }, [email, fetchData]);

  const renderChart = (widthOverride?: string) =>
  (
    <ResponsiveContainer width="100%" height={400}>


      <BarChart
        // style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
        data={data}
        margin={{
          top: 15,
          right: 0,
          left: 0,
          bottom: 0,
        }}
        barCategoryGap={widthOverride ? 0 : "10"}
      >
        {/* <CartesianGrid strokeDasharray="2 2" /> */}
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={
            {
              fontSize: 15,
              fill: "#61738d",
            }
          }
        />
        <YAxis width="auto" hide />
        <Tooltip />
        {/* <Legend /> */}
        <Bar
          dataKey="value"
          radius={[15, 15, 0, 0]}
          fill={COLORS.default}
          barSize={200}
          
        >
          <LabelList
            dataKey="value"
            position="center"
            // couleur du texte
            fill="#8000d8" 
            style={{ fontSize: "20px", fontWeight: "bold" }}
          />

          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              cursor="default"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  if (data.length == 0) {
    return (
      <div className='w-full border-2 border-base-300 mt-4 p-4 rounded-3xl'>
        <h2 className="text-xl font-bold mb-4">Aucune catégorie pour le moment</h2>
        <EmptyState
          message={"Aucune catégorie pour le moment"}
          IconComponent="Group"
        />
      </div>
    )
  }

  {/* getCategoryProductCategoryDistribution */ }
  return (
    <div className='w-full border-2 border-secondary/50 mt-4 p-4 rounded-3xl'>
      <h2 className='text-xl font-bold mb-4'>
        5 catégories avec le plus de produits
      </h2>
      {renderChart()}
    </div>
  )
};




export default CategoryChart