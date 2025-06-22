import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { mockBarData as defaultData } from "../data/mockData";

const BarChart = ({ isDashboard = false, data = null }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Utiliser les données fournies ou les données par défaut
  const chartData = data || defaultData;
  
  // Configuration pour les données de répartition par sexe
  const isRepartitionSexe = data && data.length > 0 && data[0].hasOwnProperty('sexe');
  const isRepartitionAge = data && data.length > 0 && data[0].hasOwnProperty('tranche_age');
  
  return (
    <ResponsiveBar
      data={chartData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      keys={
        isRepartitionSexe 
          ? ["Cas Parasitaires"] 
          : isRepartitionAge
          ? ["Cas Infectés"]
          : ["hot dog", "burger", "sandwich", "kebab", "fries", "donut"]
      }
      indexBy={
        isRepartitionSexe 
          ? "sexe" 
          : isRepartitionAge 
          ? "tranche_age" 
          : "country"
      }
      margin={{ top: 50, right: isDashboard ? 50 : 130, bottom: 50, left: 60 }}
      padding={0.4}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={
        isRepartitionSexe 
          ? { scheme: "paired" }
          : { scheme: "nivo" }
      }
      colorBy={isRepartitionSexe ? "indexValue" : "id"}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "#38bcb2",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "#eed312",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      borderColor={{
        from: "color",
        modifiers: [["darker", "1.6"]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : (
          isRepartitionSexe ? "Sexe" : 
          isRepartitionAge ? "Tranche d'âge" : 
          "country"
        ),
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : (
          isRepartitionSexe ? "Nombre de cas" : 
          isRepartitionAge ? "Nombre de cas infectés" :
          "food"
        ),
        legendPosition: "middle",
        legendOffset: -40,
      }}
      enableLabel={!isDashboard}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      animate={true}
      motionStiffness={90}
      motionDamping={15}
      tooltip={({ id, value, indexValue, color }) => (
        <div
          style={{
            background: colors.primary[400],
            padding: '9px 12px',
            border: `1px solid ${colors.grey[100]}`,
            borderRadius: '4px',
            color: colors.grey[100],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: color,
                marginRight: '8px',
                borderRadius: '2px'
              }}
            />
            <strong>{indexValue}</strong>
            </div>
              {isRepartitionSexe ? (
                <div>Cas parasitaires: <strong>{value}</strong></div>
              ) : isRepartitionAge ? (
                <div>Cas infectés: <strong>{value}</strong></div>
              ) : (
                <div>{id}: <strong>{value}</strong></div>
              )}
            </div>
      )}
      legends={
        isDashboard ? [] : [
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]
      }
      role="application"
      barAriaLabel={(e) => {
        if (isRepartitionSexe) {
          return `${e.indexValue}: ${e.formattedValue} cas parasitaires`;
        } else if (isRepartitionAge) {
          return `${e.indexValue}: ${e.formattedValue} cas infectés`;
        }
        return `${e.id}: ${e.formattedValue} in country: ${e.indexValue}`;
      }}
    />
  );
};

export default BarChart;